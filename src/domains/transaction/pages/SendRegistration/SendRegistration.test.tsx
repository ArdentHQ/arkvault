/* eslint-disable @typescript-eslint/require-await */
import { Observer } from "@ledgerhq/hw-transport";
import { Signatories } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SendRegistration } from "./SendRegistration";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import DelegateRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/delegate-registration.json";
import MultisignatureRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/multisignature-registration.json";
import walletFixture from "@/tests/fixtures/coins/ark/devnet/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb.json";
import {
	act,
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	MNEMONICS,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	within,
	mockNanoXTransport,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";
import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
const history = createHashHistory();
const passphrase = getDefaultWalletMnemonic();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const path = "/profiles/:profileId/wallets/:walletId/send-registration/:registrationType";

const renderPage = async (wallet: Contracts.IReadWriteWallet, type = "delegateRegistration") => {
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

const createDelegateRegistrationMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +DelegateRegistrationFixture.data.amount / 1e8,
		data: () => ({ data: () => DelegateRegistrationFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${DelegateRegistrationFixture.data.id}`,
		fee: () => +DelegateRegistrationFixture.data.fee / 1e8,
		id: () => DelegateRegistrationFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => DelegateRegistrationFixture.data.recipient,
		sender: () => DelegateRegistrationFixture.data.sender,
		type: () => "delegateRegistration",
		username: () => DelegateRegistrationFixture.data.asset.delegate.username,
		usesMultiSignature: () => false,
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
		isMultiSignatureRegistration: () => true,
		recipient: () => MultisignatureRegistrationFixture.data.recipient,
		sender: () => MultisignatureRegistrationFixture.data.sender,
		type: () => "multiSignature",
		usesMultiSignature: () => false,
	} as any);

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const formStep = () => screen.findByTestId("DelegateRegistrationForm__form-step");
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

		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findByAddressWithNetwork("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", "ark.devnet")!;
		// secondWallet = profile.wallets().findByAddressWithNetwork("D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb", "ark.devnet")!;
		secondWallet = profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
				coin: "ARK",
				network: "ark.devnet",
			}),
		);

		await wallet.synchroniser().identity();
		await secondWallet.synchroniser().identity();

		profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib",
				coin: "ARK",
				network: "ark.devnet",
			}),
		);

		await syncDelegates(profile);
		await syncFees(profile);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	beforeEach(() => {
		server.use(
			requestMock(
				"https://ark-test-musig.arkvault.io/api/wallets/DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS",
				walletFixture,
			),
			requestMock(
				"https://ark-test-musig.arkvault.io",
				{ result: { id: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc" } },
				{ method: "post" },
			),
			requestMock(
				"https://ark-test.arkvault.io/api/transactions/a73433448863755929beca76c84a80006c6efb14c905c2c53f3c89e33233d4ac",
				transactionsFixture,
			),
		);
	});

	it.each([
		["delegateRegistration", "Register Delegate"],
		["secondSignature", "Register Second Signature"],
		["multiSignature", multisignatureTitle],
	])("should handle registrationType param (%s)", async (type, label) => {
		const registrationPath = `/profiles/${getDefaultProfileId()}/wallets/${secondWallet.id()}/send-registration/${type}`;
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

	it.each([withKeyboard, "without keyboard"])("should register delegate %s", async (inputMethod) => {
		const nanoXTransportMock = mockNanoXTransport();
		const { asFragment, history } = await renderPage(wallet);

		// Step 1
		await expect(formStep()).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("Input__username"));
		await userEvent.type(screen.getByTestId("Input__username"), "test_delegate");
		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("test_delegate"));

		const fees = within(screen.getByTestId("InputFee")).getAllByTestId("ButtonGroupOption");
		await userEvent.click(fees[1]);

		await userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).not.toHaveValue("0"));

		// remove focus from fee button
		await userEvent.click(document.body);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		if (inputMethod === withKeyboard) {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

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
			.spyOn(wallet.transaction(), "signDelegateRegistration")
			.mockReturnValue(Promise.resolve(DelegateRegistrationFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [DelegateRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createDelegateRegistrationMock(wallet);

		if (inputMethod === withKeyboard) {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(sendButton());
		}

		await waitFor(() => {
			expect(signMock).toHaveBeenCalledWith({
				data: { username: "test_delegate" },
				fee: 25,
				signatory: expect.any(Signatories.Signatory),
			});
		});

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(DelegateRegistrationFixture.data.id));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(DelegateRegistrationFixture.data.id));

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

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

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
		const { container } = await renderPage(secondWallet);

		const actsWithMnemonicMock = vi.spyOn(secondWallet, "actsWithMnemonic").mockReturnValue(true);

		const { publicKey } = await secondWallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

		const secondPublicKeyMock = vi.spyOn(secondWallet, "secondPublicKey").mockReturnValue(publicKey);

		await expect(formStep()).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("Input__username"), "username");
		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("username"));

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});

		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");
		const secondMnemonic = screen.getByTestId("AuthenticationStep__second-mnemonic");

		await userEvent.type(mnemonic, MNEMONICS[0]);
		await waitFor(() => expect(mnemonic).toHaveValue(MNEMONICS[0]));

		await waitFor(() => {
			expect(secondMnemonic).toBeEnabled();
		});

		await userEvent.type(secondMnemonic, MNEMONICS[2]);
		await waitFor(() => expect(secondMnemonic).toHaveValue(MNEMONICS[2]));

		expect(sendButton()).toBeDisabled();

		await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

		expect(screen.getByTestId("Input__error")).toHaveAttribute(
			"data-errortext",
			"This mnemonic does not correspond to your wallet",
		);
		expect(container).toMatchSnapshot();

		actsWithMnemonicMock.mockRestore();
		secondPublicKeyMock.mockRestore();
		nanoXTransportMock.mockRestore();
	});

	it("should prevent going to the next step with enter on the success step", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("Input__username"), "username");
		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("username"));

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
			.spyOn(wallet.transaction(), "signDelegateRegistration")
			.mockReturnValue(Promise.resolve(DelegateRegistrationFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [DelegateRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createDelegateRegistrationMock(wallet);

		await userEvent.keyboard("{enter}");

		await waitFor(() =>
			expect(signMock).toHaveBeenCalledWith({
				data: { username: "username" },
				fee: 25,
				signatory: expect.any(Signatories.Signatory),
			}),
		);

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(DelegateRegistrationFixture.data.id));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(DelegateRegistrationFixture.data.id));

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

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		historySpy.mockRestore();
		nanoXTransportMock.mockRestore();
	});

	it("should show error step and go back", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const { asFragment } = await renderPage(secondWallet);

		const actsWithMnemonicMock = vi.spyOn(secondWallet, "actsWithMnemonic").mockReturnValue(true);

		const { publicKey } = await secondWallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

		const secondPublicKeyMock = vi.spyOn(secondWallet, "secondPublicKey").mockReturnValue(publicKey);

		await expect(formStep()).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("Input__username"), "delegate");
		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("delegate"));

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");
		const secondMnemonic = screen.getByTestId("AuthenticationStep__second-mnemonic");

		await userEvent.type(mnemonic, MNEMONICS[0]);
		await waitFor(() => expect(mnemonic).toHaveValue(MNEMONICS[0]));

		await waitFor(() => {
			expect(secondMnemonic).toBeEnabled();
		});

		await userEvent.type(secondMnemonic, MNEMONICS[1]);
		await waitFor(() => expect(secondMnemonic).toHaveValue(MNEMONICS[1]));

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		const signMock = vi
			.spyOn(secondWallet.transaction(), "signDelegateRegistration")
			.mockReturnValue(Promise.resolve(DelegateRegistrationFixture.data.id));

		const broadcastMock = vi.spyOn(secondWallet.transaction(), "broadcast").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const historyMock = vi.spyOn(history, "push").mockReturnValue();

		await waitFor(() => expect(sendButton()).toBeEnabled());
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${secondWallet.id()}`;
		await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

		historyMock.mockRestore();
		signMock.mockRestore();
		broadcastMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		secondPublicKeyMock.mockRestore();
		nanoXTransportMock.mockRestore();
	});
});
