import {
	MAINSAIL_MNEMONICS,
	act,
	env,
	getDefaultMainsailWalletMnemonic,
	getMainsailProfileId,
	mockNanoXTransport,
	render,
	screen,
	syncValidators,
	syncFees,
	waitFor,
	within,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { DateTime } from "@/app/lib/intl";
import MultisignatureRegistrationFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/multisignature-registration.json";
import { Observer } from "@ledgerhq/hw-transport";
import React from "react";
import { Route } from "react-router-dom";
import { SendRegistration } from "./SendRegistration";
import { Signatories } from "@/app/lib/sdk";
import ValidatorRegistrationFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/validator-registration.json";
import { createHashHistory } from "history";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import userEvent from "@testing-library/user-event";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
const history = createHashHistory();
const passphrase = getDefaultMainsailWalletMnemonic();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const path = "/profiles/:profileId/wallets/:walletId/send-registration/:registrationType";

const renderPage = async (wallet: Contracts.IReadWriteWallet, type = "validatorRegistration") => {
	const registrationURL = `/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/${type}`;

	history.push(registrationURL);

	const utils = render(
		<Route path={path}>
			<SendRegistration />
		</Route>,
		{
			history,
			route: registrationURL,
			withProviders: true,
		},
	);

	await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

	return {
		...utils,
		history,
	};
};

const createValidatorRegistrationMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +ValidatorRegistrationFixture.data.amount / 1e18,
		blockId: () => "1",
		confirmations: () => BigNumber.make(154_178),
		convertedAmount: () => BigNumber.make(10),
		data: () => ({ data: () => ValidatorRegistrationFixture.data }),
		explorerLink: () => `https://mainsail-explorer.ihost.org/transactions/${ValidatorRegistrationFixture.data.id}`,
		explorerLinkForBlock: () =>
			`https://mainsail-explorer.ihost.org/transactions/${ValidatorRegistrationFixture.data.id}`,
		fee: () => +ValidatorRegistrationFixture.data.fee / 1e18,
		id: () => ValidatorRegistrationFixture.data.id,
		isConfirmed: () => true,
		isDelegateRegistration: () => true,
		isDelegateResignation: () => false,
		isIpfs: () => false,
		isMultiPayment: () => false,
		isMultiSignatureRegistration: () => false,
		isSuccess: () => true,
		isTransfer: () => false,
		isUnvote: () => false,
		isUsernameRegistration: () => false,
		isUsernameResignation: () => false,
		isValidatorRegistration: () => true,
		isValidatorResignation: () => false,
		isVote: () => false,
		isVoteCombination: () => false,
		memo: () => null,
		nonce: () => BigNumber.make(1),
		recipient: () => ValidatorRegistrationFixture.data.recipient,
		sender: () => ValidatorRegistrationFixture.data.senderAddress,
		timestamp: () => DateTime.make(),
		type: () => "validatorRegistration",
		usesMultiSignature: () => false,
		wallet: () => wallet,
	});

const createMultiSignatureRegistrationMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => 0,
		data: () => ({ toSignedData: () => MultisignatureRegistrationFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${MultisignatureRegistrationFixture.data.id}`,
		fee: () => +MultisignatureRegistrationFixture.data.fee / 1e8,
		get: (attribute: string) => {
			if (attribute === "multiSignature") {
				return {
					min: 2,
					publicKeys: [
						"03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
						"034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192",
					],
				};
			}
		},
		id: () => MultisignatureRegistrationFixture.data.id,
		isConfirmed: () => true,
		isValidatorRegistration: () => false,
		isValidatorResignation: () => false,
		isIpfs: () => false,
		isMultiSignatureRegistration: () => true,
		isVote: () => false,
		nonce: () => BigNumber.make(1),
		recipient: () => MultisignatureRegistrationFixture.data.recipient,
		sender: () => MultisignatureRegistrationFixture.data.sender,
		type: () => "multiSignature",
		username: () => "username",
		usesMultiSignature: () => false,
		wallet: () => ({
			username: () => "username",
		}),
	} as any);

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const formStep = () => screen.findByTestId("ValidatorRegistrationForm_form-step");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const reviewStepID = "DelegateRegistrationForm__review-step";
const multisignatureTitle = "Multisignature Registration";
const withKeyboard = "with keyboard";

describe("Registration", () => {
	beforeAll(async () => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval", "Date"],
		});

		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile
			.wallets()
			.findByAddressWithNetwork("0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", "mainsail.devnet")!;

		vi.spyOn(wallet.coin().publicKey(), "verifyPublicKeyWithBLS").mockResolvedValue(true);
		vi.spyOn(wallet, "isMultiSignature").mockImplementation(() => false);

		secondWallet = profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
				coin: "Mainsail",
				network: "mainsail.devnet",
			}),
		);

		vi.spyOn(secondWallet, "balance").mockReturnValue(1200);

		await wallet.synchroniser().identity();
		await secondWallet.synchroniser().identity();

		await syncValidators(profile);
		await syncFees(profile);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	beforeEach(() => {
		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api/wallets*", {
				meta: {
					count: 0,
				},
			}),
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/a10a238d4ea8076532ba38282be6f35b4dd652066312d2fe7c45ba8c91c9c837",
				ValidatorRegistrationFixture,
			),
		);
	});

	it.each([
		["validatorRegistration", "Register Validator"],
		["multiSignature", multisignatureTitle],
	])("should handle registrationType param (%s)", async (type, label) => {
		const registrationPath = `/profiles/${profile.id()}/wallets/${secondWallet.id()}/send-registration/${type}`;
		history.push(registrationPath);

		render(
			<Route path={path}>
				<SendRegistration />
			</Route>,
			{
				history,
				route: registrationPath,
			},
		);

		await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent(label));
	});

	it.each([withKeyboard, "without keyboard"])("should register validator %s", async (inputMethod) => {
		const nanoXTransportMock = mockNanoXTransport();
		const { asFragment, history } = await renderPage(wallet);

		// Step 1
		await expect(formStep()).resolves.toBeVisible();

		await inputValidatorPublicKey();

		await waitFor(() => expect(continueButton()).toBeEnabled());

		if (inputMethod === withKeyboard) {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		const fees = within(screen.getByTestId("InputFee")).getAllByTestId("ButtonGroupOption");
		await userEvent.click(fees[1]);

		// remove focus from fee button
		await userEvent.click(document.body);

		await userEvent.click(screen.getByTestId("StepNavigation__back-button"));

		await expect(formStep()).resolves.toBeVisible();

		// remove focus from back button
		await userEvent.click(document.body);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		if (inputMethod === withKeyboard) {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		if (inputMethod === withKeyboard) {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.type(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).toBeEnabled());

		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorRegistration")
			.mockReturnValue(Promise.resolve(ValidatorRegistrationFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ValidatorRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createValidatorRegistrationMock(wallet);

		if (inputMethod === withKeyboard) {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(sendButton());
		}

		await waitFor(() => {
			expect(signMock).toHaveBeenCalledWith({
				data: { validatorPublicKey: "validator-public-key" },
				gasLimit: 500_000,
				gasPrice: 5.066_701_25,
				signatory: expect.any(Signatories.Signatory),
			});
		});

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.id));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.id));

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		await act(() => vi.runOnlyPendingTimers());
		// Step 4 - summary screen
		await waitFor(
			() => {
				expect(screen.getByTestId("TransactionSuccessful")).toBeVisible();
			},
			{ timeout: 4000 },
		);

		// Go back to wallet
		const historySpy = vi.spyOn(history, "push");
		await userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/dashboard`);

		historySpy.mockRestore();

		expect(asFragment()).toMatchSnapshot();

		nanoXTransportMock.mockRestore();
	});

	it.skip("should reset authentication when a supported Nano X is added", async () => {
		const unsubscribe = vi.fn();
		let observer: Observer<any>;

		const listenSpy = vi.spyOn(ledgerTransport, "listen").mockImplementationOnce((obv) => {
			observer = obv;
			return { unsubscribe };
		});

		await renderPage(wallet, "multiSignature");

		act(() => {
			observer!.next({ descriptor: "", deviceModel: { id: "nanoS" }, type: "add" });
		});

		// Ledger mocks
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());

		const getPublicKeyMock = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const signTransactionMock = vi
			.spyOn(wallet.transaction(), "signMultiSignature")
			.mockReturnValue(Promise.resolve(MultisignatureRegistrationFixture.data.id));

		const addSignatureMock = vi.spyOn(wallet.transaction(), "addSignature").mockResolvedValue({
			accepted: [MultisignatureRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});

		const multiSignatureRegistrationMock = createMultiSignatureRegistrationMock(wallet);

		const wallet2 = profile.wallets().last();

		await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent(multisignatureTitle));

		await userEvent.type(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));
		await waitFor(() => expect(continueButton()).toBeEnabled());

		// Step 2
		await userEvent.click(continueButton());

		const mockDerivationPath = vi.spyOn(wallet.data(), "get").mockReturnValue("m/44'/1'/1'/0/0");
		// Skip Authentication Step
		await userEvent.click(continueButton());

		await expect(screen.findByTestId("LedgerDeviceError")).resolves.toBeVisible();

		act(() => {
			observer!.next({ descriptor: "", deviceModel: { id: "nanoX" }, type: "add" });
		});

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent("Ledger Wallet"));

		await act(() => vi.runOnlyPendingTimers());
		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		isLedgerMock.mockRestore();
		getPublicKeyMock.mockRestore();
		signTransactionMock.mockRestore();
		multiSignatureRegistrationMock.mockRestore();
		addSignatureMock.mockRestore();
		mockDerivationPath.mockRestore();
		listenSpy.mockRestore();
	});

	it("should show mnemonic error", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(secondWallet);

		const actsWithMnemonicMock = vi.spyOn(secondWallet, "actsWithMnemonic").mockReturnValue(true);

		await expect(formStep()).resolves.toBeVisible();

		await inputValidatorPublicKey();

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});

		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");

		const wrongPassphrase = "wrong passphrase";

		await userEvent.type(mnemonic, wrongPassphrase);
		await waitFor(() => expect(mnemonic).toHaveValue(wrongPassphrase));

		expect(sendButton()).toBeDisabled();

		await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

		expect(screen.getByTestId("Input__error")).toHaveAttribute(
			"data-errortext",
			"This mnemonic does not correspond to your wallet",
		);

		actsWithMnemonicMock.mockRestore();
		nanoXTransportMock.mockRestore();
	});

	it("should prevent going to the next step with enter on the success step", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		await inputValidatorPublicKey();

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.keyboard("{enter}");

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonicInput = screen.getByTestId("AuthenticationStep__mnemonic");

		await userEvent.type(mnemonicInput, passphrase);
		await waitFor(() => expect(mnemonicInput).toHaveValue(passphrase));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorRegistration")
			.mockReturnValue(Promise.resolve(ValidatorRegistrationFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ValidatorRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createValidatorRegistrationMock(wallet);

		await userEvent.keyboard("{enter}");

		await waitFor(() =>
			expect(signMock).toHaveBeenCalledWith({
				data: { validatorPublicKey: "validator-public-key" },
				gasLimit: 500_000,
				gasPrice: 5.066_701_25,
				signatory: expect.any(Signatories.Signatory),
			}),
		);

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.id));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.id));

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		await act(() => vi.runOnlyPendingTimers());

		// Step 4 - success screen
		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		await userEvent.keyboard("{enter}");

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		nanoXTransportMock.mockRestore();
	});

	it("should go back to wallet details", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		await expect(formStep()).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("StepNavigation__back-button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/dashboard`);

		historySpy.mockRestore();
		nanoXTransportMock.mockRestore();
	});

	it("should show error step and go back", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(secondWallet);

		const actsWithMnemonicMock = vi.spyOn(secondWallet, "actsWithMnemonic").mockReturnValue(true);

		await expect(formStep()).resolves.toBeVisible();

		await inputValidatorPublicKey();

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");

		await userEvent.type(mnemonic, MAINSAIL_MNEMONICS[0]);
		await waitFor(() => expect(mnemonic).toHaveValue(MAINSAIL_MNEMONICS[0]));

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		const signMock = vi
			.spyOn(secondWallet.transaction(), "signValidatorRegistration")
			.mockReturnValue(Promise.resolve(ValidatorRegistrationFixture.data.id));

		const broadcastMock = vi.spyOn(secondWallet.transaction(), "broadcast").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const historyMock = vi.spyOn(history, "push").mockReturnValue();

		await waitFor(() => expect(sendButton()).toBeEnabled());
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		const walletDetailPage = `/profiles/${profile.id()}/dashboard`;
		await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

		historyMock.mockRestore();
		signMock.mockRestore();
		broadcastMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		nanoXTransportMock.mockRestore();
	});
});

const inputValidatorPublicKey = async (key: string = "validator-public-key") => {
	await userEvent.clear(screen.getByTestId("Input__validator_public_key"));
	await userEvent.type(screen.getByTestId("Input__validator_public_key"), key);
	await waitFor(() => expect(screen.getByTestId("Input__validator_public_key")).toHaveValue(key));
};
