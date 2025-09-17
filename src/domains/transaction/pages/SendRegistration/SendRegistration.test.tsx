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
import { SendRegistration } from "./SendRegistration";
import ValidatorRegistrationFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/validator-registration.json";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import userEvent from "@testing-library/user-event";
import { PublicKeyService } from "@/app/lib/mainsail/public-key.service";
import { LedgerTransportFactory } from "@/app/contexts";
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
const passphrase = getDefaultMainsailWalletMnemonic();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const renderPage = async (wallet: Contracts.IReadWriteWallet, type = "validatorRegistration") => {
	const registrationURL = `/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/${type}`;

	const view = render(<SendRegistration />, {
		route: registrationURL,
		withProviders: true,
	});

	await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

	return view;
};

const signedTransactionMock = {
	blockHash: () => {},
	confirmations: () => BigNumber.make(154_178),
	convertedAmount: () => BigNumber.make(10),
	convertedFee: () => {
		const fee = BigNumber.make(ValidatorRegistrationFixture.data.gasPrice)
			.times(ValidatorRegistrationFixture.data.gas)
			.dividedBy(1e8);
		return fee.toNumber();
	},
	convertedTotal: () => BigNumber.ZERO,
	data: () => ValidatorRegistrationFixture.data,
	explorerLink: () => `https://mainsail-explorer.ihost.org/transactions/${ValidatorRegistrationFixture.data.hash}`,
	explorerLinkForBlock: () =>
		`https://mainsail-explorer.ihost.org/transactions/${ValidatorRegistrationFixture.data.hash}`,
	fee: () => BigNumber.make(107),
	from: () => ValidatorRegistrationFixture.data.from,
	gasLimit: () => ValidatorRegistrationFixture.data.gasLimit,
	gasUsed: () => ValidatorRegistrationFixture.data.receipt.gasUsed,
	hash: () => ValidatorRegistrationFixture.data.hash,
	isConfirmed: () => false,
	isMultiPayment: () => false,
	isMultiSignatureRegistration: () => false,
	isReturn: () => false,
	isSecondSignature: () => false,
	isSent: () => true,
	isSuccess: () => true,
	isTransfer: () => false,
	isUnvote: () => false,
	isUpdateValidator: () => false,
	isUsernameRegistration: () => false,
	isUsernameResignation: () => false,
	isValidatorRegistration: () => false,
	isValidatorResignation: () => false,
	isVote: () => false,
	isVoteCombination: () => false,
	memo: () => ValidatorRegistrationFixture.data.memo || undefined,
	nonce: () => BigNumber.make(ValidatorRegistrationFixture.data.nonce),
	payments: () => [],
	recipients: () => [],
	timestamp: () => DateTime.make(ValidatorRegistrationFixture.data.timestamp),
	to: () => ValidatorRegistrationFixture.data.to,
	total: () => {
		const value = BigNumber.make(ValidatorRegistrationFixture.data.value);
		const feeVal = BigNumber.make(ValidatorRegistrationFixture.data.gasPrice).times(
			ValidatorRegistrationFixture.data.gas,
		);
		return value.plus(feeVal);
	},
	type: () => "transfer",
	usesMultiSignature: () => false,
	value: () => BigNumber.make(0),
	wallet: () => wallet,
};

const createValidatorRegistrationMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(signedTransactionMock);
// @ts-ignore

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
		isIpfs: () => false,
		isMultiSignatureRegistration: () => true,
		isValidatorRegistration: () => false,
		isValidatorResignation: () => false,
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

const reviewStepID = "ValidatorRegistrationForm__review-step";
const multisignatureTitle = "Multisignature Registration";
const withKeyboard = "with keyboard";

describe("Registration", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile
			.wallets()
			.findByAddressWithNetwork("0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", "mainsail.devnet")!;

		secondWallet = profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
				coin: "Mainsail",
				network: "mainsail.devnet",
			}),
		);

		vi.spyOn(secondWallet, "balance").mockReturnValue(1200);

		vi.spyOn(wallet, "isValidator").mockImplementation(() => false);
		vi.spyOn(secondWallet, "isValidator").mockImplementation(() => false);

		vi.spyOn(PublicKeyService.prototype, "verifyPublicKeyWithBLS").mockReturnValue(true);

		await wallet.synchroniser().identity();
		await secondWallet.synchroniser().identity();

		await syncValidators(profile);
		await syncFees(profile);

		vi.spyOn(env.fees(), "sync").mockImplementation(vi.fn());
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	beforeEach(() => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval", "Date"],
		});

		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api*", {
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

	it("should handle registrationType param (%s)", async () => {
		const type = "validatorRegistration";
		const label = "Register Validator";

		const registrationPath = `/profiles/${profile.id()}/wallets/${secondWallet.id()}/send-registration/${type}`;

		render(<SendRegistration />, {
			route: registrationPath,
		});

		await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent(label));
	});

	it.each([withKeyboard, "without keyboard"])("should register validator %s", async (inputMethod) => {
		vi.spyOn(wallet, "client").mockImplementation(() => ({
			transaction: vi.fn().mockReturnValue(signedTransactionMock),
		}));

		const nanoXTransportMock = mockNanoXTransport();
		const { router } = await renderPage(wallet);

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
			.mockReturnValue(Promise.resolve(ValidatorRegistrationFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ValidatorRegistrationFixture.data.hash],
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
			expect(signMock).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { validatorPublicKey: "validator-public-key", value: 0 },
				}),
			);
		});

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.hash));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.hash));

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
		await userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);

		nanoXTransportMock.mockRestore();
	});

	it.skip("should reset authentication when a supported Nano X is added", async () => {
		const unsubscribe = vi.fn();
		let observer: Observer<any>;

		const transport = new LedgerTransportFactory();
		const listenSpy = vi.spyOn(transport, "listen").mockImplementationOnce((obv) => {
			observer = obv;
			return { unsubscribe };
		});

		await renderPage(wallet, "multiSignature");

		act(() => {
			observer!.next({ descriptor: "", deviceModel: { id: "nanoS" }, type: "add" });
		});

		// Ledger mocks
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockImplementation(() => true);

		const getPublicKeyMock = vi
			.spyOn(wallet.ledger(), "getPublicKey")
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
			"This mnemonic does not correspond to your address",
		);

		actsWithMnemonicMock.mockRestore();
		nanoXTransportMock.mockRestore();
	});

	it("should prevent going to the next step with enter on the success step", async () => {
		vi.spyOn(wallet, "client").mockImplementation(() => ({
			transaction: vi.fn().mockResolvedValue(signedTransactionMock),
		}));

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
			.mockReturnValue(Promise.resolve(ValidatorRegistrationFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ValidatorRegistrationFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createValidatorRegistrationMock(wallet);

		await userEvent.keyboard("{enter}");

		await waitFor(() =>
			expect(signMock).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { validatorPublicKey: "validator-public-key", value: 0 },
				}),
			),
		);

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.hash));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.hash));

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		await act(async () => {
			vi.runOnlyPendingTimers(); // Run the setInterval callback
			await new Promise((resolve) => setImmediate(resolve)); // Ensure microtasks complete
		});

		// Step 4 - success screen
		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		await userEvent.keyboard("{enter}");

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		nanoXTransportMock.mockRestore();
	});

	it("should go back to wallet details", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const { router } = await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("StepNavigation__back-button"));

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);

		nanoXTransportMock.mockRestore();
	});

	it("should show error step and go back", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const { router } = await renderPage(secondWallet);

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
			.mockReturnValue(Promise.resolve(ValidatorRegistrationFixture.data.hash));

		const broadcastMock = vi.spyOn(secondWallet.transaction(), "broadcast").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		await waitFor(() => expect(sendButton()).toBeEnabled());
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		const walletDetailPage = `/profiles/${profile.id()}/dashboard`;
		await waitFor(() => expect(router.state.location.pathname).toBe(walletDetailPage));

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
