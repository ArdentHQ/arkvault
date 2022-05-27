/* eslint-disable @typescript-eslint/require-await */
import { Observer } from "@ledgerhq/hw-transport";
import { Signatories } from "@payvo/sdk";
import { BIP39 } from "@payvo/sdk-cryptography";
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import { SendRegistration } from "./SendRegistration";
import { LedgerProvider, minVersionList, useLedgerContext } from "@/app/contexts";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import DelegateRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/delegate-registration.json";
import MultisignatureRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/multisignature-registration.json";
import SecondSignatureRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/second-signature-registration.json";
import {
	act,
	defaultNetMocks,
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
	mockNanoSTransport,
	mockNanoXTransport,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
const history = createHashHistory();
const passphrase = getDefaultWalletMnemonic();
let getVersionSpy: jest.SpyInstance;

const path = "/profiles/:profileId/wallets/:walletId/send-registration/:registrationType";

const renderPage = async (wallet: Contracts.IReadWriteWallet, type = "delegateRegistration") => {
	const registrationURL = `/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/${type}`;

	history.push(registrationURL);

	const SendRegistrationWrapper = () => {
		const { listenDevice } = useLedgerContext();

		useEffect(() => {
			listenDevice();
		}, []);

		return <SendRegistration />;
	};

	const utils = render(
		<Route path={path}>
			<SendRegistrationWrapper />
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
	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +DelegateRegistrationFixture.data.amount / 1e8,
		data: () => ({ data: () => DelegateRegistrationFixture.data }),
		explorerLink: () => `https://dexplorer.ark.io/transaction/${DelegateRegistrationFixture.data.id}`,
		fee: () => +DelegateRegistrationFixture.data.fee / 1e8,
		id: () => DelegateRegistrationFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => DelegateRegistrationFixture.data.recipient,
		sender: () => DelegateRegistrationFixture.data.sender,
		type: () => "delegateRegistration",
		username: () => DelegateRegistrationFixture.data.asset.delegate.username,
		usesMultiSignature: () => false,
	});

const createSecondSignatureRegistrationMock = (wallet: Contracts.IReadWriteWallet) =>
	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => 0,
		data: () => ({ data: () => SecondSignatureRegistrationFixture.data }),
		explorerLink: () => `https://dexplorer.ark.io/transaction/${SecondSignatureRegistrationFixture.data.id}`,
		fee: () => +SecondSignatureRegistrationFixture.data.fee / 1e8,
		id: () => SecondSignatureRegistrationFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => SecondSignatureRegistrationFixture.data.recipient,
		sender: () => SecondSignatureRegistrationFixture.data.sender,
		type: () => "secondSignature",
		usesMultiSignature: () => false,
	} as any);

const createMultiSignatureRegistrationMock = (wallet: Contracts.IReadWriteWallet) =>
	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => 0,
		data: () => ({ toSignedData: () => MultisignatureRegistrationFixture.data }),
		explorerLink: () => `https://dexplorer.ark.io/transaction/${MultisignatureRegistrationFixture.data.id}`,
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

		getVersionSpy = jest
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

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
		getVersionSpy.mockRestore();
	});

	beforeEach(() => {
		nock.cleanAll();
		defaultNetMocks();

		nock("https://ark-test-musig.payvo.com/")
			.get("/api/wallets/DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS")
			.reply(200, require("tests/fixtures/coins/ark/devnet/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb.json"));

		nock("https://ark-test-musig.payvo.com")
			.post("/")
			.reply(200, { result: { id: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc" } })
			.persist();
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
				<LedgerProvider>
					<SendRegistration />
				</LedgerProvider>
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

		userEvent.paste(screen.getByTestId("Input__username"), "test_delegate");
		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("test_delegate"));

		const fees = within(screen.getByTestId("InputFee")).getAllByTestId("ButtonGroupOption");
		userEvent.click(fees[1]);

		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).not.toHaveValue("0"));

		// remove focus from fee button
		userEvent.click(document.body);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		if (inputMethod === withKeyboard) {
			userEvent.keyboard("{enter}");
		} else {
			userEvent.click(continueButton());
		}

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("StepNavigation__back-button"));

		await expect(formStep()).resolves.toBeVisible();

		// remove focus from back button
		userEvent.click(document.body);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		if (inputMethod === withKeyboard) {
			userEvent.keyboard("{enter}");
		} else {
			userEvent.click(continueButton());
		}

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		if (inputMethod === withKeyboard) {
			userEvent.keyboard("{enter}");
		} else {
			userEvent.click(continueButton());
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		userEvent.paste(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).toBeEnabled());

		const signMock = jest
			.spyOn(wallet.transaction(), "signDelegateRegistration")
			.mockReturnValue(Promise.resolve(DelegateRegistrationFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [DelegateRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createDelegateRegistrationMock(wallet);

		if (inputMethod === withKeyboard) {
			userEvent.keyboard("{enter}");
		} else {
			userEvent.click(sendButton());
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

		// Step 4 - summary screen
		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		// Go back to wallet
		const historySpy = jest.spyOn(history, "push");
		userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		historySpy.mockRestore();

		expect(asFragment()).toMatchSnapshot();

		nanoXTransportMock.mockRestore();
	});

	it("should register second signature", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const bip39GenerateMock = jest.spyOn(BIP39, "generate").mockReturnValue(passphrase);

		const { asFragment } = await renderPage(wallet, "secondSignature");

		await expect(screen.findByTestId("SecondSignatureRegistrationForm__generation-step")).resolves.toBeVisible();

		const fees = within(screen.getByTestId("InputFee")).getAllByTestId("ButtonGroupOption");
		userEvent.click(fees[1]);

		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).not.toHaveValue("0"));

		userEvent.click(continueButton());

		await expect(screen.findByTestId("SecondSignatureRegistrationForm__backup-step")).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("SecondSignatureRegistrationForm__verification-step")).resolves.toBeVisible();

		const words = passphrase.split(" ");

		for (let index = 0; index < 3; index++) {
			const wordNumber = Number.parseInt(screen.getByText(/Select the/).innerHTML.replace(/Select the/, ""));

			userEvent.click(screen.getByText(words[wordNumber - 1]));

			if (index < 2) {
				await waitFor(() => expect(screen.queryAllByText(/The (\d+)/).length === 2 - index));
			}
		}

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId("SecondSignatureRegistrationForm__review-step")).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).toBeEnabled());

		expect(asFragment()).toMatchSnapshot();

		const signMock = jest
			.spyOn(wallet.transaction(), "signSecondSignature")
			.mockReturnValue(Promise.resolve(SecondSignatureRegistrationFixture.data.id));

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [SecondSignatureRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});

		const transactionMock = createSecondSignatureRegistrationMock(wallet);

		userEvent.click(sendButton());

		await waitFor(() =>
			expect(signMock).toHaveBeenCalledWith({
				data: { mnemonic: passphrase },
				fee: 0.1,
				signatory: expect.any(Signatories.Signatory),
			}),
		);

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(SecondSignatureRegistrationFixture.data.id));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(SecondSignatureRegistrationFixture.data.id));

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		bip39GenerateMock.mockRestore();
		nanoXTransportMock.mockRestore();
	});

	it("should send multisignature registration", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet, "multiSignature");

		const signTransactionMock = jest
			.spyOn(wallet.transaction(), "signMultiSignature")
			.mockReturnValue(Promise.resolve(MultisignatureRegistrationFixture.data.id));

		const addSignatureMock = jest.spyOn(wallet.transaction(), "addSignature").mockResolvedValue({
			accepted: [MultisignatureRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});

		const multiSignatureRegistrationMock = createMultiSignatureRegistrationMock(wallet);

		const wallet2 = profile.wallets().last();

		await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent(multisignatureTitle));

		userEvent.paste(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));
		await waitFor(() => expect(continueButton()).toBeEnabled());

		// Step 2
		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		// Review step
		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Authentication step
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");
		userEvent.paste(mnemonic, passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		signTransactionMock.mockRestore();
		multiSignatureRegistrationMock.mockRestore();
		addSignatureMock.mockRestore();
		nanoXTransportMock.mockRestore();
	});

	it("should show ledger error screen in authentication if nanoS is connected", async () => {
		const nanoSSpy = mockNanoSTransport();
		await renderPage(wallet, "multiSignature");

		// Ledger mocks
		const isLedgerMock = jest.spyOn(wallet, "isLedger").mockImplementation(() => true);
		jest.spyOn(wallet.coin(), "__construct").mockImplementation();

		const getPublicKeyMock = jest
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const signTransactionMock = jest
			.spyOn(wallet.transaction(), "signMultiSignature")
			.mockReturnValue(Promise.resolve(MultisignatureRegistrationFixture.data.id));

		const addSignatureMock = jest.spyOn(wallet.transaction(), "addSignature").mockResolvedValue({
			accepted: [MultisignatureRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});

		const multiSignatureRegistrationMock = createMultiSignatureRegistrationMock(wallet);

		const wallet2 = profile.wallets().last();

		await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent(multisignatureTitle));

		userEvent.paste(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));
		await waitFor(() => expect(continueButton()).toBeEnabled());

		// Step 2
		userEvent.click(continueButton());

		const mockDerivationPath = jest.spyOn(wallet.data(), "get").mockReturnValue("m/44'/1'/1'/0/0");
		// Skip Authentication Step
		userEvent.click(continueButton());

		await waitFor(() => expect(screen.getByTestId("LedgerDeviceError")).toBeVisible());

		isLedgerMock.mockRestore();
		getPublicKeyMock.mockRestore();
		signTransactionMock.mockRestore();
		multiSignatureRegistrationMock.mockRestore();
		addSignatureMock.mockRestore();
		mockDerivationPath.mockRestore();
		nanoSSpy.mockRestore();
	});

	it.skip("should reset authentication when a supported Nano X is added", async () => {
		const unsubscribe = jest.fn();
		let observer: Observer<any>;

		const listenSpy = jest.spyOn(ledgerTransport, "listen").mockImplementationOnce((obv) => {
			observer = obv;
			return { unsubscribe };
		});

		await renderPage(wallet, "multiSignature");

		act(() => {
			observer!.next({ descriptor: "", deviceModel: { id: "nanoS" }, type: "add" });
		});

		// Ledger mocks
		const isLedgerMock = jest.spyOn(wallet, "isLedger").mockImplementation(() => true);
		jest.spyOn(wallet.coin(), "__construct").mockImplementation();

		const getPublicKeyMock = jest
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const signTransactionMock = jest
			.spyOn(wallet.transaction(), "signMultiSignature")
			.mockReturnValue(Promise.resolve(MultisignatureRegistrationFixture.data.id));

		const addSignatureMock = jest.spyOn(wallet.transaction(), "addSignature").mockResolvedValue({
			accepted: [MultisignatureRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});

		const multiSignatureRegistrationMock = createMultiSignatureRegistrationMock(wallet);

		const wallet2 = profile.wallets().last();

		await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent(multisignatureTitle));

		userEvent.paste(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));
		await waitFor(() => expect(continueButton()).toBeEnabled());

		// Step 2
		userEvent.click(continueButton());

		const mockDerivationPath = jest.spyOn(wallet.data(), "get").mockReturnValue("m/44'/1'/1'/0/0");
		// Skip Authentication Step
		userEvent.click(continueButton());

		await expect(screen.findByTestId("LedgerDeviceError")).resolves.toBeVisible();

		act(() => {
			observer!.next({ descriptor: "", deviceModel: { id: "nanoX" }, type: "add" });
		});

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent("Ledger Wallet"));

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		isLedgerMock.mockRestore();
		getPublicKeyMock.mockRestore();
		signTransactionMock.mockRestore();
		multiSignatureRegistrationMock.mockRestore();
		addSignatureMock.mockRestore();
		mockDerivationPath.mockRestore();
		listenSpy.mockRestore();
	});

	it("should set fee", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);
		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("25"));

		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.SIMPLE),
		);

		expect(screen.queryByTestId("InputCurrency")).not.toBeInTheDocument();

		nanoXTransportMock.mockRestore();
	});

	it("should return to form step by cancelling fee warning", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("Input__username"), "test_delegate");

		expect(screen.getByTestId("Input__username")).toHaveValue("test_delegate");

		// Fee
		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "10");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// Fee warning
		expect(screen.getByTestId("FeeWarning__cancel-button")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));

		await expect(formStep()).resolves.toBeVisible();

		nanoXTransportMock.mockRestore();
	});

	it("should proceed to authentication step by confirming fee warning", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("Input__username"), "test_delegate");

		expect(screen.getByTestId("Input__username")).toHaveValue("test_delegate");

		// Fee
		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "10");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// Fee warning
		expect(screen.getByTestId("FeeWarning__continue-button")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		nanoXTransportMock.mockRestore();
	});

	it("should show mnemonic error", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const { container } = await renderPage(secondWallet);

		const actsWithMnemonicMock = jest.spyOn(secondWallet, "actsWithMnemonic").mockReturnValue(true);

		const { publicKey } = await secondWallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

		const secondPublicKeyMock = jest.spyOn(secondWallet, "secondPublicKey").mockReturnValue(publicKey);

		await expect(formStep()).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("Input__username"), "username");
		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("username"));

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");
		const secondMnemonic = screen.getByTestId("AuthenticationStep__second-mnemonic");

		userEvent.paste(mnemonic, MNEMONICS[0]);
		await waitFor(() => expect(mnemonic).toHaveValue(MNEMONICS[0]));

		userEvent.paste(secondMnemonic, MNEMONICS[2]);
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

		userEvent.paste(screen.getByTestId("Input__username"), "username");
		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("username"));

		userEvent.keyboard("{enter}");

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.keyboard("{enter}");

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonicInput = screen.getByTestId("AuthenticationStep__mnemonic");

		userEvent.paste(mnemonicInput, passphrase);
		await waitFor(() => expect(mnemonicInput).toHaveValue(passphrase));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const signMock = jest
			.spyOn(wallet.transaction(), "signDelegateRegistration")
			.mockReturnValue(Promise.resolve(DelegateRegistrationFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [DelegateRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createDelegateRegistrationMock(wallet);

		userEvent.keyboard("{enter}");

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

		// Step 4 - success screen
		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		userEvent.keyboard("{enter}");

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		nanoXTransportMock.mockRestore();
	});

	it("should go back to wallet details", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("StepNavigation__back-button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		historySpy.mockRestore();
		nanoXTransportMock.mockRestore();
	});

	it("should show error step and go back", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const { asFragment } = await renderPage(secondWallet);

		const actsWithMnemonicMock = jest.spyOn(secondWallet, "actsWithMnemonic").mockReturnValue(true);

		const { publicKey } = await secondWallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

		const secondPublicKeyMock = jest.spyOn(secondWallet, "secondPublicKey").mockReturnValue(publicKey);

		await expect(formStep()).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("Input__username"), "delegate");
		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("delegate"));

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");
		const secondMnemonic = screen.getByTestId("AuthenticationStep__second-mnemonic");

		userEvent.paste(mnemonic, MNEMONICS[0]);
		await waitFor(() => expect(mnemonic).toHaveValue(MNEMONICS[0]));

		userEvent.paste(secondMnemonic, MNEMONICS[1]);
		await waitFor(() => expect(secondMnemonic).toHaveValue(MNEMONICS[1]));

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		const broadcastMock = jest.spyOn(secondWallet.transaction(), "broadcast").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const historyMock = jest.spyOn(history, "push").mockReturnValue();

		userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("ErrorStep__wallet-button"));

		const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${secondWallet.id()}`;
		await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

		historyMock.mockRestore();
		broadcastMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		secondPublicKeyMock.mockRestore();
		nanoXTransportMock.mockRestore();
	});

	it("should send multisignature registration with ledger wallet", async () => {
		const envPersistMock = jest.spyOn(env, "persist").mockImplementation(jest.fn());
		// Ledger mocks
		const nanoXTransportMock = mockNanoXTransport();
		const isLedgerMock = jest.spyOn(wallet, "isLedger").mockImplementation(() => true);
		jest.spyOn(wallet.coin(), "__construct").mockImplementation();

		const getPublicKeyMock = jest
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const signTransactionMock = jest
			.spyOn(wallet.transaction(), "signMultiSignature")
			.mockReturnValue(Promise.resolve(MultisignatureRegistrationFixture.data.id));

		const addSignatureMock = jest.spyOn(wallet.transaction(), "addSignature").mockResolvedValue({
			accepted: [MultisignatureRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});

		const multiSignatureRegistrationMock = createMultiSignatureRegistrationMock(wallet);

		const wallet2 = profile.wallets().last();

		await renderPage(wallet, "multiSignature");

		await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent(multisignatureTitle));

		userEvent.paste(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));
		await waitFor(() => expect(continueButton()).toBeEnabled());

		// Step 2
		userEvent.click(continueButton());

		const mockDerivationPath = jest.spyOn(wallet.data(), "get").mockReturnValue("m/44'/1'/1'/0/0");
		// Skip Authentication Step
		userEvent.click(continueButton());

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent("Ledger Wallet"));

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		isLedgerMock.mockRestore();
		getPublicKeyMock.mockRestore();
		signTransactionMock.mockRestore();
		multiSignatureRegistrationMock.mockRestore();
		addSignatureMock.mockRestore();
		mockDerivationPath.mockRestore();
		nanoXTransportMock.mockRestore();
		envPersistMock.mockRestore();
	});
});
