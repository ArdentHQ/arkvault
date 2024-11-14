import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SendDelegateResignation } from "./SendDelegateResignation";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	within,
	act,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";
import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;

let resignationUrl: string;

const passphrase = MNEMONICS[0];
const history = createHashHistory();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const renderPage = () => {
	const path = "/profiles/:profileId/wallets/:walletId/send-delegate-resignation";

	return render(
		<Route path={path}>
			<SendDelegateResignation />
		</Route>,
		{
			history,
			route: resignationUrl,
		},
	);
};

const transactionResponse = {
	amount: () => +transactionFixture.data.amount / 1e8,
	blockId: () => "1",
	convertedAmount: () => BigNumber.make(10),
	data: () => ({ data: () => transactionFixture.data }),
	explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.id}`,
	explorerLinkForBlock: () => `https://test.arkscan.io/block/${transactionFixture.data.id}`,
	fee: () => +transactionFixture.data.fee / 1e8,
	id: () => transactionFixture.data.id,
	isConfirmed: () => true,
	isDelegateRegistration: () => false,
	isDelegateResignation: () => false,
	isIpfs: () => false,
	isMultiPayment: () => false,
	isMultiSignatureRegistration: () => false,
	isReturn: () => false,
	isSent: () => true,
	isTransfer: () => false,
	isUnvote: () => false,
	isVote: () => false,
	isVoteCombination: () => false,
	memo: () => null,
	nonce: () => BigNumber.make(1),
	recipient: () => transactionFixture.data.recipient,
	sender: () => transactionFixture.data.sender,
	timestamp: () => DateTime.make(),
	total: () => +transactionFixture.data.amount / 1e8,
	type: () => "delegateResignation",
	usesMultiSignature: () => false,
	wallet: () => wallet,
};

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(transactionResponse as any);

const secondMnemonic = () => screen.getByTestId("AuthenticationStep__second-mnemonic");
const reviewStep = () => screen.findByTestId("SendDelegateResignation__review-step");
const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const formStep = () => screen.findByTestId("SendDelegateResignation__form-step");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

let mnemonicMock;
let secondMnemonicMock;

describe("SendDelegateResignation", () => {
	beforeAll(async () => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval", "Date"],
		});

		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		// wallet = profile.wallets().findById("d044a552-7a49-411c-ae16-8ff407acc430");
		wallet = profile.wallets().push(
			await profile.walletFactory().fromMnemonicWithBIP39({
				coin: "ARK",
				mnemonic: passphrase,
				network: "ark.devnet",
			}),
		);
		await wallet.synchroniser().identity();

		await syncDelegates(profile);
		await syncFees(profile);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	describe("Delegate Resignation", () => {
		beforeEach(() => {
			resignationUrl = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-delegate-resignation`;
			history.push(resignationUrl);

			mnemonicMock = vi
				.spyOn(wallet.coin().address(), "fromMnemonic")
				.mockResolvedValue({ address: wallet.address() });

			secondMnemonicMock = vi
				.spyOn(wallet.coin().publicKey(), "fromMnemonic")
				.mockResolvedValue({ publicKey: wallet.publicKey() });

			server.use(
				requestMock(
					"https://ark-test.arkvault.io/api/transactions/8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
					transactionsFixture,
				),
			);
		});

		it("should show mnemonic authentication error", async () => {
			mnemonicMock.mockRestore();
			secondMnemonicMock.mockRestore();

			const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			await waitFor(() => {
				expect(secondMnemonic()).toBeEnabled();
			});

			await userEvent.clear(secondMnemonic());
			await userEvent.type(secondMnemonic(), MNEMONICS[2]);
			await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[2]));

			await waitFor(() => {
				expect(secondMnemonic()).toHaveAttribute("aria-invalid");
			});

			expect(sendButton()).toBeDisabled();

			expect(asFragment()).toMatchSnapshot();

			secondPublicKeyMock.mockRestore();
		});

		it("should render 1st step", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should change fee", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			// Fee (simple)
			expect(screen.getAllByRole("radio")[1]).toBeChecked();

			await userEvent.click(within(screen.getByTestId("InputFee")).getAllByRole("radio")[2]);
			await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

			// Fee (advanced)
			await userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

			const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

			inputElement.select();
			await userEvent.clear(inputElement);
			await userEvent.type(inputElement, "1");

			await waitFor(() => expect(inputElement).toHaveValue("1"));

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render 2nd step", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should go back to wallet details", async () => {
			const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("StepNavigation__back-button"));

			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

			historySpy.mockRestore();
		});

		it("should navigate between 1st and 2nd step", async () => {
			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("StepNavigation__back-button"));

			await expect(formStep()).resolves.toBeVisible();
		});

		it("should render 3rd step", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should return to form step by cancelling fee warning", async () => {
			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			// Fee
			await userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

			const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

			inputElement.select();
			await userEvent.clear(inputElement);
			await userEvent.type(inputElement, "30");

			await waitFor(() => expect(inputElement).toHaveValue("30"));

			await waitFor(() => expect(continueButton()).not.toBeDisabled());

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("FeeWarning__cancel-button")).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));

			await expect(formStep()).resolves.toBeVisible();
		});

		it("should proceed to authentication step by confirming fee warning", async () => {
			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			// Fee
			await userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

			const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

			inputElement.select();
			await userEvent.clear(inputElement);
			await userEvent.type(inputElement, "30");

			await waitFor(() => expect(inputElement).toHaveValue("30"));

			await waitFor(() => expect(continueButton()).not.toBeDisabled());

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("FeeWarning__continue-button")).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
		});

		it("should show error step and go back", async () => {
			// Run signDelegate once to prevent assertion error (sdk).
			try {
				await wallet.transaction().signDelegateResignation({
					fee: 4,
					signatory: await wallet.signatoryFactory().make({
						mnemonic: MNEMONICS[1],
					}),
				});
			} catch {
				//
			}

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockImplementation(() => {
				throw new Error("broadcast error");
			});

			const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			await waitFor(() => expect(secondMnemonic()).toBeEnabled());

			await userEvent.clear(secondMnemonic());
			await userEvent.type(secondMnemonic(), MNEMONICS[1]);
			await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[1]));

			await waitFor(() => {
				expect(sendButton()).toBeEnabled();
			});

			await userEvent.click(sendButton());

			await waitFor(() => {
				expect(screen.getByTestId("ErrorStep")).toBeInTheDocument();
			});

			expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
			expect(asFragment()).toMatchSnapshot();

			const historyMock = vi.spyOn(history, "push").mockReturnValue();

			await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

			const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}`;
			await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

			historyMock.mockRestore();

			secondPublicKeyMock.mockRestore();
			broadcastMock.mockRestore();
		});

		it("should successfully sign and submit resignation transaction", async () => {
			const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

			const signMock = vi
				.spyOn(wallet.transaction(), "signDelegateResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));
			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			});
			const transactionMock = createTransactionMock(wallet);

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			await waitFor(() => {
				expect(secondMnemonic()).toBeEnabled();
			});

			await userEvent.clear(secondMnemonic());
			await userEvent.type(secondMnemonic(), MNEMONICS[1]);
			await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[1]));

			await waitFor(() => {
				expect(sendButton()).toBeEnabled();
			});

			userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			secondPublicKeyMock.mockRestore();
			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
		});

		it("should successfully sign and submit resignation transaction with keyboard", async () => {
			const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

			const signMock = vi
				.spyOn(wallet.transaction(), "signDelegateResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));
			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			});
			const transactionMock = createTransactionMock(wallet);

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			userEvent.keyboard("{enter}");

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.keyboard("{enter}");

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			await waitFor(() => {
				expect(secondMnemonic()).toBeEnabled();
			});

			await userEvent.clear(secondMnemonic());
			await userEvent.type(secondMnemonic(), MNEMONICS[1]);
			await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[1]));

			userEvent.keyboard("{enter}");
			userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			secondPublicKeyMock.mockRestore();
			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
		});

		it("should click back button after successful submission", async () => {
			const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

			const signMock = vi
				.spyOn(wallet.transaction(), "signDelegateResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));
			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			});
			const transactionMock = createTransactionMock(wallet);

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

			await waitFor(() => {
				expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase);
			});

			await waitFor(() => {
				expect(secondMnemonic()).toBeInTheDocument();
			});

			await waitFor(() => {
				expect(secondMnemonic()).toBeEnabled();
			});

			await userEvent.clear(secondMnemonic());
			await userEvent.type(secondMnemonic(), MNEMONICS[1]);

			await waitFor(() => {
				expect(secondMnemonic()).toHaveValue(MNEMONICS[1]);
			});

			await waitFor(() => {
				expect(sendButton()).toBeEnabled();
			});

			userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			const historyMock = vi.spyOn(history, "push").mockReturnValue();

			userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

			const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}`;
			await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

			historyMock.mockRestore();

			secondPublicKeyMock.mockRestore();
			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
		});

		it("should successfully sign and submit resignation transaction using encryption password", async () => {
			const actsWithMnemonicMock = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
			const actsWithWifWithEncryptionMock = vi.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);
			const wifGetMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

			const secondPublicKeyMock = vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false);
			const signMock = vi
				.spyOn(wallet.transaction(), "signDelegateResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));
			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			});
			const transactionMock = createTransactionMock(wallet);

			const resignationEncryptedUrl = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-delegate-resignation`;
			history.push(resignationEncryptedUrl);

			render(
				<Route path="/profiles/:profileId/wallets/:walletId/send-delegate-resignation">
					<SendDelegateResignation />
				</Route>,
				{
					history,
					route: resignationEncryptedUrl,
				},
			);

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__encryption-password"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__encryption-password"), "password", {
				delay: 100,
			});
			await waitFor(() =>
				expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password"),
			);

			await waitFor(() => expect(sendButton()).not.toBeDisabled());

			await userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			secondPublicKeyMock.mockRestore();
			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
			actsWithMnemonicMock.mockRestore();
			actsWithWifWithEncryptionMock.mockRestore();
			wifGetMock.mockRestore();
		});
	});
});
