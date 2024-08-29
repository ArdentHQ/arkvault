/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import { Contracts } from "@ardenthq/sdk-profiles";
import { Observer } from "@ledgerhq/hw-transport";
import React from "react";
import { Route } from "react-router-dom";
import { Signatories } from "@ardenthq/sdk";
import { createHashHistory } from "history";
import userEvent from "@testing-library/user-event";
import { SendRegistration } from "./SendRegistration";
import * as useFeesMock from "@/app/hooks/use-fees";
import * as useSearchParametersValidationHook from "@/app/hooks/use-search-parameters-validation";
import {
	MNEMONICS,
	act,
	env,
	getDefaultProfileId,
	getMainsailProfileId,
	getDefaultWalletMnemonic,
	getMainsailDefaultWalletMnemonic,
	mockNanoXTransport,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	within,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import DelegateRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/delegate-registration.json";
import MultisignatureRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/multisignature-registration.json";
import UsernameRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/username-registration.json";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";
import walletFixture from "@/tests/fixtures/coins/ark/devnet/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb.json";
import { TransactionFixture } from "@/tests/fixtures/transactions";

const history = createHashHistory();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const defaultPath = "/profiles/:profileId/wallets/:walletId/send-registration/:registrationType";

const renderPage = async (
	profile: Contracts.IProfile,
	wallet: Contracts.IReadWriteWallet,
	type = "delegateRegistration",
	path = defaultPath,
	route?: string,
) => {
	const registrationURL = route ?? `/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/${type}`;

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

const createUsernameRegistrationMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +UsernameRegistrationFixture.data.amount / 1e8,
		data: () => ({ data: () => UsernameRegistrationFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${UsernameRegistrationFixture.data.id}`,
		fee: () => +UsernameRegistrationFixture.data.fee / 1e8,
		id: () => UsernameRegistrationFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => UsernameRegistrationFixture.data.recipient,
		sender: () => UsernameRegistrationFixture.data.sender,
		type: () => "usernameRegistration",
		username: () => UsernameRegistrationFixture.data.asset.username,
		usesMultiSignature: () => false,
	});

const createMultiSignatureRegistrationMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		...TransactionFixture,
		amount: () => 0,
		data: () => ({ data: () => {}, toSignedData: () => MultisignatureRegistrationFixture.data }),
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
	beforeAll(() => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval", "Date"],
		});
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	describe("ARK network", () => {
		let profile: Contracts.IProfile;
		let wallet: Contracts.IReadWriteWallet;
		let secondWallet: Contracts.IReadWriteWallet;

		const passphrase = getDefaultWalletMnemonic();

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
			["usernameRegistration", "Register Username"],
		])("should handle registrationType param (%s)", async (type, label) => {
			const registrationPath = `/profiles/${getDefaultProfileId()}/wallets/${secondWallet.id()}/send-registration/${type}`;
			history.push(registrationPath);

			render(
				<Route path={defaultPath}>
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
			const { asFragment, history } = await renderPage(profile, wallet);

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

			await act(() => vi.runOnlyPendingTimers());
			// Step 4 - summary screen
			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			// Go back to wallet
			const historySpy = vi.spyOn(history, "push");
			userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

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

			await renderPage(profile, wallet, "multiSignature");

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

			userEvent.paste(screen.getByTestId("SelectDropdown__input"), wallet2.address());

			userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

			await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));
			await waitFor(() => expect(continueButton()).toBeEnabled());

			// Step 2
			userEvent.click(continueButton());

			const mockDerivationPath = vi.spyOn(wallet.data(), "get").mockReturnValue("m/44'/1'/1'/0/0");
			// Skip Authentication Step
			userEvent.click(continueButton());

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
			const { container } = await renderPage(profile, secondWallet);

			const actsWithMnemonicMock = vi.spyOn(secondWallet, "actsWithMnemonic").mockReturnValue(true);

			const { publicKey } = await secondWallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = vi.spyOn(secondWallet, "secondPublicKey").mockReturnValue(publicKey);

			await expect(formStep()).resolves.toBeVisible();

			userEvent.paste(screen.getByTestId("Input__username"), "username");
			await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("username"));

			await waitFor(() => {
				expect(continueButton()).toBeEnabled();
			});

			userEvent.click(continueButton());
			await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

			await waitFor(() => expect(continueButton()).not.toBeDisabled());

			userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");
			const secondMnemonic = screen.getByTestId("AuthenticationStep__second-mnemonic");

			userEvent.paste(mnemonic, MNEMONICS[0]);
			await waitFor(() => expect(mnemonic).toHaveValue(MNEMONICS[0]));

			await waitFor(() => {
				expect(secondMnemonic).toBeEnabled();
			});

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
			const mockTransactionFind = vi
				.spyOn(wallet.transaction(), "transaction")
				.mockReturnValue(TransactionFixture);
			const nanoXTransportMock = mockNanoXTransport();
			await renderPage(profile, wallet);

			await expect(formStep()).resolves.toBeVisible();

			userEvent.paste(screen.getByTestId("Input__username"), "username");
			await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("username"));

			await waitFor(() => {
				expect(continueButton()).toBeEnabled();
			});

			userEvent.click(continueButton());

			await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

			await waitFor(() => expect(continueButton()).not.toBeDisabled());

			userEvent.keyboard("{enter}");

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			const mnemonicInput = screen.getByTestId("AuthenticationStep__mnemonic");

			userEvent.paste(mnemonicInput, passphrase);
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

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			// Step 4 - success screen
			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			userEvent.keyboard("{enter}");

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			nanoXTransportMock.mockRestore();
			mockTransactionFind.mockRestore();
		});

		it("should go back to wallet details", async () => {
			const nanoXTransportMock = mockNanoXTransport();
			await renderPage(profile, wallet);

			const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

			await expect(formStep()).resolves.toBeVisible();

			userEvent.click(screen.getByTestId("StepNavigation__back-button"));

			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

			historySpy.mockRestore();
			nanoXTransportMock.mockRestore();
		});

		it("should show error step and close", async () => {
			const nanoXTransportMock = mockNanoXTransport();
			await renderPage(profile, secondWallet);

			const actsWithMnemonicMock = vi.spyOn(secondWallet, "actsWithMnemonic").mockReturnValue(true);

			const { publicKey } = await secondWallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = vi.spyOn(secondWallet, "secondPublicKey").mockReturnValue(publicKey);

			await expect(formStep()).resolves.toBeVisible();

			userEvent.paste(screen.getByTestId("Input__username"), "delegate");
			await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("delegate"));

			await waitFor(() => {
				expect(continueButton()).toBeEnabled();
			});

			userEvent.click(continueButton());

			await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

			await waitFor(() => expect(continueButton()).not.toBeDisabled());

			userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");
			const secondMnemonic = screen.getByTestId("AuthenticationStep__second-mnemonic");

			userEvent.paste(mnemonic, MNEMONICS[0]);
			await waitFor(() => expect(mnemonic).toHaveValue(MNEMONICS[0]));

			await waitFor(() => {
				expect(secondMnemonic).toBeEnabled();
			});

			userEvent.paste(secondMnemonic, MNEMONICS[1]);
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
			userEvent.click(sendButton());

			await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

			expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");

			userEvent.click(screen.getByTestId("ErrorStep__close-button"));

			const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${secondWallet.id()}`;
			await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

			historyMock.mockRestore();
			signMock.mockRestore();
			broadcastMock.mockRestore();
			actsWithMnemonicMock.mockRestore();
			secondPublicKeyMock.mockRestore();
			nanoXTransportMock.mockRestore();
		});

		it("should show error step and go back", async () => {
			const nanoXTransportMock = mockNanoXTransport();
			await renderPage(profile, secondWallet);

			const actsWithMnemonicMock = vi.spyOn(secondWallet, "actsWithMnemonic").mockReturnValue(true);

			const { publicKey } = await secondWallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = vi.spyOn(secondWallet, "secondPublicKey").mockReturnValue(publicKey);

			await expect(formStep()).resolves.toBeVisible();

			userEvent.paste(screen.getByTestId("Input__username"), "delegate");
			await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("delegate"));

			await waitFor(() => {
				expect(continueButton()).toBeEnabled();
			});

			userEvent.click(continueButton());

			await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

			await waitFor(() => expect(continueButton()).not.toBeDisabled());

			userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");
			const secondMnemonic = screen.getByTestId("AuthenticationStep__second-mnemonic");

			userEvent.paste(mnemonic, MNEMONICS[0]);
			await waitFor(() => expect(mnemonic).toHaveValue(MNEMONICS[0]));

			await waitFor(() => {
				expect(secondMnemonic).toBeEnabled();
			});

			userEvent.paste(secondMnemonic, MNEMONICS[1]);
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
			userEvent.click(sendButton());

			await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

			expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");

			userEvent.click(screen.getByTestId("ErrorStep__back-button"));

			await waitFor(() => expect(formStep()).resolves.toBeVisible());

			historyMock.mockRestore();
			signMock.mockRestore();
			broadcastMock.mockRestore();
			actsWithMnemonicMock.mockRestore();
			secondPublicKeyMock.mockRestore();
			nanoXTransportMock.mockRestore();
		});
	});

	describe("Mainsail Network", () => {
		let profile: Contracts.IProfile;
		let wallet: Contracts.IReadWriteWallet;

		const passphrase = getMainsailDefaultWalletMnemonic();

		beforeAll(async () => {
			profile = env.profiles().findById(getMainsailProfileId());

			await env.profiles().restore(profile);
			await profile.sync();

			wallet = profile.wallets().first();

			await wallet.synchroniser().identity();

			await syncDelegates(profile);
			await syncFees(profile);
		});

		beforeEach(() => {
			server.use(
				requestMock(
					"https://ark-test-musig.arkvault.io/api/wallets/0xdE983E8d323d045fde918B535eA43e1672a9B4ea",
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

		it.each([withKeyboard, "without keyboard"])("should register username for mainsail %s", async (inputMethod) => {
			// Emulate not found username
			server.use(requestMock("https://dwallets.mainsailhq.com/api/wallets/test_username", {}, { status: 404 }));

			const envAvailableNetworksMock = vi.spyOn(env, "availableNetworks").mockReturnValue([wallet.network()]);

			const feesMock = vi.spyOn(useFeesMock, "useFees").mockImplementation(() => ({
				calculate: vi.fn().mockResolvedValue({ avg: 25, max: 25, min: 25, static: 25 }),
			}));
			const nanoXTransportMock = mockNanoXTransport();
			const { history } = await renderPage(profile, wallet, "usernameRegistration");

			// Step 1
			await expect(screen.findByTestId("UsernameRegistrationForm__form-step")).resolves.toBeVisible();

			screen.getByTestId("Input__username").focus();
			userEvent.paste(screen.getByTestId("Input__username"), "test_username");
			await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("test_username"));

			await waitFor(() => expect(screen.getByTestId("InputCurrency")).not.toHaveValue("0"));

			await waitFor(() => expect(continueButton()).toBeEnabled());

			if (inputMethod === withKeyboard) {
				userEvent.keyboard("{enter}");
			} else {
				userEvent.click(continueButton());
			}

			await expect(screen.findByTestId("UsernameRegistrationForm__review-step")).resolves.toBeVisible();

			if (inputMethod === withKeyboard) {
				userEvent.keyboard("{enter}");
			} else {
				userEvent.click(continueButton());
			}

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");

			userEvent.paste(passwordInput, getMainsailDefaultWalletMnemonic());

			await waitFor(() => expect(passwordInput).toHaveValue(getMainsailDefaultWalletMnemonic()));

			await waitFor(() => expect(sendButton()).toBeEnabled());

			const signMock = vi
				.spyOn(wallet.transaction(), "signUsernameRegistration")
				.mockReturnValue(Promise.resolve(UsernameRegistrationFixture.data.id));
			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [UsernameRegistrationFixture.data.id],
				errors: {},
				rejected: [],
			});
			const transactionMock = createUsernameRegistrationMock(wallet);

			if (inputMethod === withKeyboard) {
				userEvent.keyboard("{enter}");
			} else {
				userEvent.click(sendButton());
			}

			await waitFor(() => {
				expect(signMock).toHaveBeenCalledWith({
					data: { username: "test_username" },
					fee: 25,
					signatory: expect.any(Signatories.Signatory),
				});
			});

			await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(UsernameRegistrationFixture.data.id));
			await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(UsernameRegistrationFixture.data.id));

			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();

			// Step 4 - summary screen
			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			// Go back to wallet
			const historySpy = vi.spyOn(history, "push");
			userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

			historySpy.mockRestore();

			nanoXTransportMock.mockRestore();
			feesMock.mockRestore();
			envAvailableNetworksMock.mockRestore();
		});

		it("should create musig username registration transaction", async () => {
			const isMultiSignatureSpy = vi.spyOn(wallet, "isMultiSignature").mockReturnValue(true);
			const multisignatureSpy = vi.spyOn(wallet.multiSignature(), "all").mockReturnValue({
				min: 2,
				publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
			});

			// Emulate not found username
			server.use(requestMock("https://dwallets.mainsailhq.com/api/wallets/test_username", {}, { status: 404 }));

			const envAvailableNetworksMock = vi.spyOn(env, "availableNetworks").mockReturnValue([wallet.network()]);

			const feesMock = vi.spyOn(useFeesMock, "useFees").mockImplementation(() => ({
				calculate: vi.fn().mockResolvedValue({ avg: 25, max: 25, min: 25, static: 25 }),
			}));

			const nanoXTransportMock = mockNanoXTransport();
			await renderPage(profile, wallet, "usernameRegistration");

			// Step 1
			await expect(screen.findByTestId("UsernameRegistrationForm__form-step")).resolves.toBeVisible();

			screen.getByTestId("Input__username").focus();
			userEvent.paste(screen.getByTestId("Input__username"), "test_username");

			await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("test_username"));
			await waitFor(() => expect(screen.getByTestId("InputCurrency")).not.toHaveValue("0"));

			await waitFor(() => expect(continueButton()).toBeEnabled());

			userEvent.click(continueButton());

			await expect(screen.findByTestId("UsernameRegistrationForm__review-step")).resolves.toBeVisible();

			const signMock = vi
				.spyOn(wallet.transaction(), "signUsernameRegistration")
				.mockReturnValue(Promise.resolve(UsernameRegistrationFixture.data.id));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [UsernameRegistrationFixture.data.id],
				errors: {},
				rejected: [],
			});

			const transactionMock = vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
				amount: () => +UsernameRegistrationFixture.data.amount / 1e8,
				data: () => ({ data: () => UsernameRegistrationFixture.data }),
				explorerLink: () => `https://test.arkscan.io/transaction/${UsernameRegistrationFixture.data.id}`,
				fee: () => +UsernameRegistrationFixture.data.fee / 1e8,
				id: () => UsernameRegistrationFixture.data.id,
				isMultiSignatureRegistration: () => false,
				recipient: () => UsernameRegistrationFixture.data.recipient,
				sender: () => UsernameRegistrationFixture.data.sender,
				type: () => "usernameRegistration",
				username: () => UsernameRegistrationFixture.data.asset.username,
				usesMultiSignature: () => true,
			});

			await waitFor(() => expect(continueButton()).toBeEnabled());
			userEvent.click(continueButton());

			await waitFor(() => {
				expect(signMock).toHaveBeenCalledWith({
					data: { username: "test_username" },
					fee: 25,
					signatory: expect.any(Signatories.Signatory),
				});
			});

			await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(UsernameRegistrationFixture.data.id));
			await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(UsernameRegistrationFixture.data.id));

			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();

			nanoXTransportMock.mockRestore();
			feesMock.mockRestore();
			envAvailableNetworksMock.mockRestore();

			isMultiSignatureSpy.mockRestore();
			multisignatureSpy.mockRestore();
		});

		it("should create musig validator registration transaction", async () => {
			const isMultiSignatureSpy = vi.spyOn(wallet, "isMultiSignature").mockReturnValue(true);
			const multisignatureSpy = vi.spyOn(wallet.multiSignature(), "all").mockReturnValue({
				min: 2,
				publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
			});

			const envAvailableNetworksMock = vi.spyOn(env, "availableNetworks").mockReturnValue([wallet.network()]);

			const feesMock = vi.spyOn(useFeesMock, "useFees").mockImplementation(() => ({
				calculate: vi.fn().mockResolvedValue({ avg: 25, max: 25, min: 25, static: 25 }),
			}));

			// Emulate public key hasn't used
			server.use(requestMock(`https://dwallets.mainsailhq.com/api/wallets*`, { meta: { count: 0 } }));

			const nanoXTransportMock = mockNanoXTransport();
			await renderPage(profile, wallet, "delegateRegistration");

			// Step 1
			await expect(formStep()).resolves.toBeVisible();

			const blsPublicKey =
				"84c48b1f7388d582a042718c35d9f57dcb9c4314be8b44807a14f329a3bb3853796882756d32e8e11e034f1e7e072cc2";

			screen.getByTestId("Input__validator_public_key").focus();
			userEvent.paste(screen.getByTestId("Input__validator_public_key"), blsPublicKey);

			await waitFor(() => expect(screen.getByTestId("InputCurrency")).not.toHaveValue("0"));

			await waitFor(() => expect(continueButton()).toBeEnabled());

			userEvent.click(continueButton());

			await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

			const signMock = vi
				.spyOn(wallet.transaction(), "signDelegateRegistration")
				.mockReturnValue(Promise.resolve(DelegateRegistrationFixture.data.id));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [DelegateRegistrationFixture.data.id],
				errors: {},
				rejected: [],
			});

			const transactionMock = vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
				amount: () => +DelegateRegistrationFixture.data.amount / 1e8,
				data: () => ({ data: () => DelegateRegistrationFixture.data }),
				explorerLink: () => `https://test.arkscan.io/transaction/${DelegateRegistrationFixture.data.id}`,
				fee: () => +DelegateRegistrationFixture.data.fee / 1e8,
				id: () => DelegateRegistrationFixture.data.id,
				isMultiSignatureRegistration: () => false,
				recipient: () => DelegateRegistrationFixture.data.recipient,
				sender: () => DelegateRegistrationFixture.data.sender,
				type: () => "delegateRegistration",
				username: () => DelegateRegistrationFixture.data.asset.username,
				usesMultiSignature: () => true,
			});

			await waitFor(() => expect(continueButton()).toBeEnabled());
			userEvent.click(continueButton());

			await waitFor(() => {
				expect(signMock).toHaveBeenCalledWith({
					data: { validatorPublicKey: blsPublicKey },
					fee: 25,
					signatory: expect.any(Signatories.Signatory),
				});
			});

			await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(UsernameRegistrationFixture.data.id));
			await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(UsernameRegistrationFixture.data.id));

			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();

			nanoXTransportMock.mockRestore();
			feesMock.mockRestore();
			envAvailableNetworksMock.mockRestore();

			isMultiSignatureSpy.mockRestore();
			multisignatureSpy.mockRestore();
		});

		it.each([withKeyboard, "without keyboard"])(
			"should register username without url wallet %s",
			async (inputMethod) => {
				const extractNetworkFromParametersMock = vi
					.spyOn(useSearchParametersValidationHook, "extractNetworkFromParameters")
					.mockReturnValue(wallet.network());

				const noWalletPath = "/profiles/:profileId/send-registration/:registrationType";
				const noWalletRoute = `/profiles/${profile.id()}/send-registration/usernameRegistration`;

				// Emulate not found username
				server.use(
					requestMock("https://dwallets.mainsailhq.com/api/wallets/test_username", {}, { status: 404 }),
				);

				const envAvailableNetworksMock = vi.spyOn(env, "availableNetworks").mockReturnValue([wallet.network()]);

				const feesMock = vi.spyOn(useFeesMock, "useFees").mockImplementation(() => ({
					calculate: vi.fn().mockResolvedValue({ avg: 25, max: 25, min: 25, static: 25 }),
				}));
				const nanoXTransportMock = mockNanoXTransport();
				const { history } = await renderPage(
					profile,
					wallet,
					"usernameRegistration",
					noWalletPath,
					noWalletRoute,
				);

				// Step 1
				await expect(screen.findByTestId("UsernameRegistrationForm__form-step")).resolves.toBeVisible();

				// Select address
				expect(screen.getByTestId("SelectAddress__wrapper")).toBeInTheDocument();

				userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

				await waitFor(() => {
					expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
				});

				const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");

				userEvent.click(firstAddress);

				expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

				screen.getByTestId("Input__username").focus();
				userEvent.paste(screen.getByTestId("Input__username"), "test_username");
				await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("test_username"));

				await waitFor(() => expect(screen.getByTestId("InputCurrency")).not.toHaveValue("0"));

				await waitFor(() => expect(continueButton()).toBeEnabled());

				if (inputMethod === withKeyboard) {
					userEvent.keyboard("{enter}");
				} else {
					userEvent.click(continueButton());
				}

				await expect(screen.findByTestId("UsernameRegistrationForm__review-step")).resolves.toBeVisible();

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

				const signMock = vi
					.spyOn(wallet.transaction(), "signUsernameRegistration")
					.mockReturnValue(Promise.resolve(UsernameRegistrationFixture.data.id));
				const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
					accepted: [UsernameRegistrationFixture.data.id],
					errors: {},
					rejected: [],
				});
				const transactionMock = createUsernameRegistrationMock(wallet);

				if (inputMethod === withKeyboard) {
					userEvent.keyboard("{enter}");
				} else {
					userEvent.click(sendButton());
				}

				await waitFor(() => {
					expect(signMock).toHaveBeenCalledWith({
						data: { username: "test_username" },
						fee: 25,
						signatory: expect.any(Signatories.Signatory),
					});
				});

				await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(UsernameRegistrationFixture.data.id));
				await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(UsernameRegistrationFixture.data.id));

				signMock.mockRestore();
				broadcastMock.mockRestore();
				transactionMock.mockRestore();

				// Step 4 - summary screen
				await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

				// Go back to wallet
				const historySpy = vi.spyOn(history, "push");
				userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

				expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

				historySpy.mockRestore();

				nanoXTransportMock.mockRestore();
				feesMock.mockRestore();
				envAvailableNetworksMock.mockRestore();
				extractNetworkFromParametersMock.mockRestore();
			},
		);

		it("should go back to profile if no url wallet", async () => {
			const extractNetworkFromParametersMock = vi
				.spyOn(useSearchParametersValidationHook, "extractNetworkFromParameters")
				.mockReturnValue(wallet.network());

			const noWalletPath = "/profiles/:profileId/send-registration/:registrationType";
			const noWalletRoute = `/profiles/${profile.id()}/send-registration/usernameRegistration`;

			const nanoXTransportMock = mockNanoXTransport();
			const { history } = await renderPage(profile, wallet, "usernameRegistration", noWalletPath, noWalletRoute);

			// Step 1
			await expect(screen.findByTestId("UsernameRegistrationForm__form-step")).resolves.toBeVisible();

			const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

			userEvent.click(screen.getByTestId("StepNavigation__back-button"));

			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}`);

			historySpy.mockRestore();
			nanoXTransportMock.mockRestore();
			extractNetworkFromParametersMock.mockRestore();
		});
	});
});
