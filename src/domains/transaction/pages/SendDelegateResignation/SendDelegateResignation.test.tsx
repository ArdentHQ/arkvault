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
} from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;

let resignationUrl: string;

const passphrase = MNEMONICS[0];
const history = createHashHistory();

jest.mock("@/utils/delay", () => ({
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
	data: () => ({ data: () => transactionFixture.data }),
	explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.id}`,
	fee: () => +transactionFixture.data.fee / 1e8,
	id: () => transactionFixture.data.id,
	isMultiSignatureRegistration: () => false,
	recipient: () => transactionFixture.data.recipient,
	sender: () => transactionFixture.data.sender,
	type: () => "delegateResignation",
	usesMultiSignature: () => false,
};

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue(transactionResponse as any);

const secondMnemonic = () => screen.getByTestId("AuthenticationStep__second-mnemonic");
const reviewStep = () => screen.findByTestId("SendDelegateResignation__review-step");
const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const formStep = () => screen.findByTestId("SendDelegateResignation__form-step");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

describe("SendDelegateResignation", () => {
	beforeAll(async () => {
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

	describe("Delegate Resignation", () => {
		beforeEach(() => {
			resignationUrl = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-delegate-resignation`;
			history.push(resignationUrl);
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

			userEvent.click(within(screen.getByTestId("InputFee")).getAllByRole("radio")[2]);
			await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

			// Fee (advanced)
			userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

			const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

			inputElement.select();
			userEvent.paste(inputElement, "1");

			await waitFor(() => expect(inputElement).toHaveValue("1"));

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render 2nd step", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should go back to wallet details", async () => {
			const historySpy = jest.spyOn(history, "push").mockImplementation();

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			userEvent.click(screen.getByTestId("StepNavigation__back-button"));

			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

			historySpy.mockRestore();
		});

		it("should navigate between 1st and 2nd step", async () => {
			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.click(screen.getByTestId("StepNavigation__back-button"));

			await expect(formStep()).resolves.toBeVisible();
		});

		it("should render 3rd step", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should return to form step by cancelling fee warning", async () => {
			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			// Fee
			userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

			const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

			inputElement.select();
			userEvent.paste(inputElement, "30");

			await waitFor(() => expect(inputElement).toHaveValue("30"));

			await waitFor(() => expect(continueButton()).not.toBeDisabled());

			userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(screen.findByTestId("FeeWarning__cancel-button")).resolves.toBeVisible();

			userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));

			await expect(formStep()).resolves.toBeVisible();
		});

		it("should proceed to authentication step by confirming fee warning", async () => {
			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			// Fee
			userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

			const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

			inputElement.select();
			userEvent.paste(inputElement, "30");

			await waitFor(() => expect(inputElement).toHaveValue("30"));

			await waitFor(() => expect(continueButton()).not.toBeDisabled());

			userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(screen.findByTestId("FeeWarning__continue-button")).resolves.toBeVisible();

			userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
		});

		it("should show mnemonic authentication error", async () => {
			const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = jest.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			userEvent.paste(secondMnemonic(), MNEMONICS[2]);
			await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[2]));

			expect(secondMnemonic()).toHaveAttribute("aria-invalid");
			expect(sendButton()).toBeDisabled();

			expect(asFragment()).toMatchSnapshot();

			secondPublicKeyMock.mockRestore();
		});

		it("should show error step and go back", async () => {
			const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockImplementation(() => {
				throw new Error("broadcast error");
			});

			const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = jest.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			userEvent.paste(secondMnemonic(), MNEMONICS[1]);
			await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[1]));

			userEvent.click(sendButton());

			await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

			expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
			expect(asFragment()).toMatchSnapshot();

			const historyMock = jest.spyOn(history, "push").mockReturnValue();

			userEvent.click(screen.getByTestId("ErrorStep__wallet-button"));

			const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}`;
			await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

			historyMock.mockRestore();

			secondPublicKeyMock.mockRestore();
			broadcastMock.mockRestore();
		});

		it("should successfully sign and submit resignation transaction", async () => {
			const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = jest.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

			const signMock = jest
				.spyOn(wallet.transaction(), "signDelegateResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));
			const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			});
			const transactionMock = createTransactionMock(wallet);

			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			userEvent.paste(secondMnemonic(), MNEMONICS[1]);
			await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[1]));

			userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();

			secondPublicKeyMock.mockRestore();
			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
		});

		it("should successfully sign and submit resignation transaction with keyboard", async () => {
			const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = jest.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

			const signMock = jest
				.spyOn(wallet.transaction(), "signDelegateResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));
			const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			});
			const transactionMock = createTransactionMock(wallet);

			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			userEvent.keyboard("{enter}");

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.keyboard("{enter}");

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			userEvent.paste(secondMnemonic(), MNEMONICS[1]);
			await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[1]));

			userEvent.keyboard("{enter}");
			userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();

			secondPublicKeyMock.mockRestore();
			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
		});

		it("should back button after successful submission", async () => {
			const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

			const secondPublicKeyMock = jest.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

			const signMock = jest
				.spyOn(wallet.transaction(), "signDelegateResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));
			const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
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

			userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			userEvent.paste(secondMnemonic(), MNEMONICS[1]);
			await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[1]));

			userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			const historyMock = jest.spyOn(history, "push").mockReturnValue();

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
			const actsWithMnemonicMock = jest.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
			const actsWithWifWithEncryptionMock = jest.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);
			const wifGetMock = jest.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

			const secondPublicKeyMock = jest.spyOn(wallet, "isSecondSignature").mockReturnValue(false);
			const signMock = jest
				.spyOn(wallet.transaction(), "signDelegateResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));
			const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			});
			const transactionMock = createTransactionMock(wallet);

			const resignationEncryptedUrl = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-delegate-resignation`;
			history.push(resignationEncryptedUrl);

			const { asFragment } = render(
				<Route path="/profiles/:profileId/wallets/:walletId/send-delegate-resignation">
					<SendDelegateResignation />
				</Route>,
				{
					history,
					route: resignationEncryptedUrl,
				},
			);

			await expect(formStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			userEvent.paste(screen.getByTestId("AuthenticationStep__encryption-password"), "password");
			await waitFor(() =>
				expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password"),
			);

			await waitFor(() => expect(sendButton()).not.toBeDisabled());

			userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();

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
