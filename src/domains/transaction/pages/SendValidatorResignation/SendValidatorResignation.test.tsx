import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SendValidatorResignation } from "./SendValidatorResignation";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json" with { type: "json" };
import {
	env,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	within,
	act,
	getMainsailProfileId,
	MAINSAIL_MNEMONICS,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import { expect } from "vitest";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;

let resignationUrl: string;

const passphrase = MAINSAIL_MNEMONICS[0];
const history = createHashHistory();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const renderPage = () => {
	const path = "/profiles/:profileId/wallets/:walletId/send-validator-resignation";

	return render(
		<Route path={path}>
			<SendValidatorResignation />
		</Route>,
		{
			history,
			route: resignationUrl,
		},
	);
};

const transactionResponse = {
	amount: () => +transactionFixture.data.amount / 1e18,
	blockId: () => "1",
	confirmations: () => 154_178,
	convertedAmount: () => BigNumber.make(10),
	data: () => ({ data: () => transactionFixture.data }),
	explorerLink: () => `https://mainsail-explorer.ihost.org/transactions/${transactionFixture.data.id}`,
	explorerLinkForBlock: () => `https://mainsail-explorer.ihost.org/block/${transactionFixture.data.blockId}`,
	fee: () => BigNumber.make(0.000_106_4),
	id: () => transactionFixture.data.id,
	isConfirmed: () => true,
	isDelegateRegistration: () => false,
	isDelegateResignation: () => true,
	isIpfs: () => false,
	isMultiPayment: () => false,
	isMultiSignatureRegistration: () => false,
	isReturn: () => false,
	isSent: () => true,
	isSuccess: () => true,
	isTransfer: () => false,
	isUnvote: () => false,
	isUsernameRegistration: () => false,
	isUsernameResignation: () => false,
	isValidatorRegistration: () => false,
	isValidatorResignation: () => true,
	isVote: () => false,
	isVoteCombination: () => false,
	memo: () => null,
	nonce: () => BigNumber.make(1),
	recipient: () => transactionFixture.data.recipient,
	sender: () => transactionFixture.data.senderAddress,
	timestamp: () => DateTime.make(),
	total: () => +transactionFixture.data.amount / 1e8,
	type: () => "validatorResignation",
	usesMultiSignature: () => false,
	wallet: () => wallet,
};

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(transactionResponse as any);

const reviewStep = () => screen.findByTestId("SendValidatorResignation__review-step");
const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const formStep = () => screen.findByTestId("SendValidatorResignation__form-step");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

let mnemonicMock;

describe("SendValidatorResignation", () => {
	beforeAll(async () => {
		process.env.USE_MAINSAIL_NETWORK = "true";
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval", "Date"],
		});

		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().push(
			await profile.walletFactory().fromMnemonicWithBIP39({
				coin: "Mainsail",
				mnemonic: passphrase,
				network: "mainsail.devnet",
			}),
		);

		vi.spyOn(wallet, "balance").mockReturnValue(1200);
		vi.spyOn(wallet, "validatorPublicKey").mockReturnValue("validator-public-key");
		vi.spyOn(wallet, "isMultiSignature").mockImplementation(() => false);

		const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {});
		profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, {
			...config,
			activeNetworkId: wallet.networkId(),
		});

		await wallet.synchroniser().identity();

		await syncDelegates(profile);
		await syncFees(profile);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	describe("Validator Resignation", () => {
		beforeEach(() => {
			resignationUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}/send-validator-resignation`;
			history.push(resignationUrl);

			mnemonicMock = vi
				.spyOn(wallet.coin().address(), "fromMnemonic")
				.mockResolvedValue({ address: wallet.address() });

			server.use(
				requestMock(
					"https://dwallets-evm.mainsailhq.com/api/transactions/8e4a8c3eaf2f9543a5bd61bb85ddd2205d5091597a77446c8b99692e0854b978",
					transactionFixture,
				),
			);
		});

		it("should show mnemonic authentication error", async () => {
			mnemonicMock.mockRestore();

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), "wrong passphrase");
			await waitFor(() =>
				expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue("wrong passphrase"),
			);

			expect(sendButton()).toBeDisabled();

			await waitFor(() => {
				expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveAttribute("aria-invalid");
			});
		});

		it("should render 1st step", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should change fee", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			// Fee (simple)
			expect(screen.getAllByRole("radio")[1]).toBeChecked();

			await userEvent.click(within(screen.getByTestId("InputFee")).getAllByRole("radio")[2]);
			await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

			// Fee (advanced)
			await userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

			const gasPriceInput: HTMLInputElement = screen.getByTestId("Input_GasPrice");
			await userEvent.clear(gasPriceInput);
			await userEvent.type(gasPriceInput, "10");

			await waitFor(() => expect(gasPriceInput).toHaveValue("10"));

			const gasLimitInput: HTMLInputElement = screen.getByTestId("Input_GasLimit");
			await userEvent.clear(gasLimitInput);
			await userEvent.type(gasLimitInput, "210000");

			await waitFor(() => expect(gasLimitInput).toHaveValue("210000"));

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render 2nd step", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await waitFor(() => expect(continueButton()).toBeEnabled());

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should go back to dashboard", async () => {
			const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("StepNavigation__back-button"));

			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/dashboard`);

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

		it("should show error step and go back", async () => {
			const signMock = vi
				.spyOn(wallet.transaction(), "signValidatorResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockImplementation(() => {
				throw new Error("broadcast error");
			});

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

			const dashboardPage = `/profiles/${profile.id()}/dashboard`;
			await waitFor(() => expect(historyMock).toHaveBeenCalledWith(dashboardPage));

			historyMock.mockRestore();

			signMock.mockRestore();
			broadcastMock.mockRestore();
		});

		it("should successfully sign and submit resignation transaction", async () => {
			const signMock = vi
				.spyOn(wallet.transaction(), "signValidatorResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			});

			const transactionMock = createTransactionMock(wallet);

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			await waitFor(() => {
				expect(sendButton()).toBeEnabled();
			});

			await userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
		});

		it("should successfully sign and submit resignation transaction with keyboard", async () => {
			const signMock = vi
				.spyOn(wallet.transaction(), "signValidatorResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			});

			const transactionMock = createTransactionMock(wallet);

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await waitFor(() => expect(continueButton()).toBeEnabled());

			await userEvent.keyboard("{enter}");

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.keyboard("{enter}");

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			await waitFor(() => expect(sendButton()).toBeEnabled());
			await userEvent.keyboard("{enter}");

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
		});

		it("should click back button after successful submission", async () => {
			const signMock = vi
				.spyOn(wallet.transaction(), "signValidatorResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			});

			const transactionMock = createTransactionMock(wallet);

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

			await waitFor(() => {
				expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase);
			});

			await waitFor(() => {
				expect(sendButton()).toBeEnabled();
			});

			await userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			const historyMock = vi.spyOn(history, "push").mockReturnValue();

			await userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

			const dashboardPage = `/profiles/${profile.id()}/dashboard`;
			await waitFor(() => expect(historyMock).toHaveBeenCalledWith(dashboardPage));

			historyMock.mockRestore();

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
				.spyOn(wallet.transaction(), "signValidatorResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.id));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			});

			const transactionMock = createTransactionMock(wallet);

			const resignationEncryptedUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}/send-validator-resignation`;
			history.push(resignationEncryptedUrl);

			render(
				<Route path="/profiles/:profileId/wallets/:walletId/send-validator-resignation">
					<SendValidatorResignation />
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
