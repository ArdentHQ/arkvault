/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SendTransfer } from "./SendTransfer";
import * as useFeesHook from "@/app/hooks/use-fees";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncFees,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
	act,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";
import nodeFeesFixture from "@/tests/fixtures/coins/ark/mainnet/node-fees.json";
import transactionFeesFixture from "@/tests/fixtures/coins/ark/mainnet/transaction-fees.json";

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +transactionFixture.data.amount / 1e8,
		data: () => ({ data: () => transactionFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.id}`,
		fee: () => +transactionFixture.data.fee / 1e8,
		id: () => transactionFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => transactionFixture.data.recipient,
		recipients: () => [
			{
				address: transactionFixture.data.recipient,
				amount: +transactionFixture.data.amount / 1e8,
			},
		],
		sender: () => transactionFixture.data.sender,
		type: () => "transfer",
		usesMultiSignature: () => false,
	} as any);

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let resetProfileNetworksMock: () => void;

const selectFirstRecipient = () => userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
const selectRecipient = () =>
	userEvent.click(within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"));
const backToWalletButton = () => screen.getByTestId("StepNavigation__back-to-wallet-button");
const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const backButton = () => screen.getByTestId("StepNavigation__back-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const ARKDevnetIconID = "NetworkOption-ARK-ark.devnet";
const networkStepID = "SendTransfer__network-step";
const reviewStepID = "SendTransfer__review-step";
const formStepID = "SendTransfer__form-step";
const sendAllID = "AddRecipient__send-all";

const history = createHashHistory();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("SendTransfer Fee Handling", () => {
	beforeAll(async () => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval", "Date"],
		});

		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		// Profile needs a wallet on the mainnet network to show network selection
		// step.
		const { wallet: arkMainnetWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.mainnet",
		});
		profile.wallets().push(arkMainnetWallet);

		profile.coins().set("ARK", "ark.devnet");

		server.use(
			requestMock("https://ark-live.arkvault.io/api/node/fees", nodeFeesFixture),
			requestMock("https://ark-live.arkvault.io/api/transactions/fees", transactionFeesFixture),
		);
		await syncFees(profile);
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		server.use(
			requestMock(
				"https://ark-test.arkvault.io/api/transactions/8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
				transactionFixture,
			),
			requestMock("https://ark-test.arkvault.io/api/transactions", transactionsFixture, {
				query: { address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
			}),
			requestMock(
				"https://ark-test.arkvault.io/api/transactions",
				{ data: [], meta: {} },
				{
					query: {
						limit: 20,
						page: 1,
						senderId: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
					},
				},
			),
			requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }),
		);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it("should update available amount after sender address changed", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/send-transfer`;
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(networkStepID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(ARKDevnetIconID));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Select sender
		userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const secondAddress = screen.getByTestId("SearchWalletListItem__select-1");
		userEvent.click(secondAddress);

		expect(screen.getByText("57.60679402")).toBeInTheDocument();

		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "55");

		await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());

		// Select sender
		userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");
		userEvent.click(firstAddress);

		expect(screen.getByText("33.67769203")).toBeInTheDocument();

		await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();
	});

	it("should sync wallet if new sender wallet is not restored or synced", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/send-transfer`;

		history.push(transferURL);

		const selectedWallet = profile.wallets().findByCoinWithNetwork("ARK", "ark.devnet")[0];

		const selectedWalletSpy = vi.spyOn(selectedWallet, "hasBeenFullyRestored").mockReturnValue(false);

		const walletSyncSpy = vi.spyOn(selectedWallet.synchroniser(), "identity");

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(networkStepID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(ARKDevnetIconID));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Select sender
		userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const secondAddress = screen.getByTestId("SearchWalletListItem__select-1");
		userEvent.click(secondAddress);

		expect(screen.getByText("57.60679402")).toBeInTheDocument();

		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "55");

		await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());

		// Select sender
		userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");

		userEvent.click(firstAddress);

		expect(screen.getByText("33.67769203")).toBeInTheDocument();

		await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();

		expect(walletSyncSpy).toHaveBeenCalledWith();

		selectedWalletSpy.mockRestore();

		walletSyncSpy.mockRestore();
	});

	it("should recalculate amount when fee changes and send all is selected", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		selectRecipient();

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"));

		expect(screen.getByTestId(sendAllID)).toHaveClass("active");

		userEvent.click(screen.getByTestId(sendAllID));

		expect(screen.getByTestId(sendAllID)).not.toHaveClass("active");

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.AVERAGE));
		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toBeChecked());

		expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0.07320598");

		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		expect(screen.getAllByRole("radio")[2]).toHaveTextContent("0.1");
	});

	it("should keep the selected fee when user steps back", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "12");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("12"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		expect(backButton()).not.toHaveAttribute("disabled");

		userEvent.click(backButton());

		// Step 1 again
		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Thw fast fee should still be selected
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		// Go back to step 2 (the fast fee should still be the one used)
		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		expect(screen.getAllByTestId("Amount")[2]).toHaveTextContent("0.1");
	});

	it("should handle fee change", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		const goSpy = vi.spyOn(history, "go").mockImplementation(vi.fn());

		expect(backButton()).not.toHaveAttribute("disabled");

		userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		selectRecipient();

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.AVERAGE));
		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toBeChecked());

		expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0.07320598");

		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		expect(screen.getAllByRole("radio")[2]).toHaveTextContent("0.1");

		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "1000000000");

		await waitFor(() => expect(inputElement).toHaveValue("1000000000"));

		goSpy.mockRestore();
	});

	it("should correctly handle fees when network's fee type is size", async () => {
		const { wallet: arkWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.devnet",
		});

		vi.spyOn(arkWallet, "balance").mockReturnValue(10);
		vi.spyOn(arkWallet, "isDelegate").mockReturnValue(false);

		profile.wallets().push(arkWallet);

		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${arkWallet.id()}/send-transfer`;

		history.push(transferURL);

		const useFeesMock = vi.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () => Promise.resolve({ avg: 0.1, isDynamic: true, max: 0.1, min: 0.1, static: 0.1 }),
		});

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(arkWallet.address()));

		const goSpy = vi.spyOn(history, "go").mockImplementation(vi.fn());

		expect(backButton()).not.toHaveAttribute("disabled");

		userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		// Select recipient
		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(profile.wallets().first().address()),
		);

		// Set amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Assert that fee initial value is 0 and then it changes to 0.1 when loaded
		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toHaveTextContent("Average0.1 DARK"));
		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		// Continue to review step
		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		expect(within(screen.getByTestId(reviewStepID)).getAllByTestId("Amount")[0]).toHaveTextContent("1 DARK");
		expect(within(screen.getByTestId(reviewStepID)).getAllByTestId("Amount")[1]).toHaveTextContent("0.1 DARK");
		expect(within(screen.getByTestId(reviewStepID)).getAllByTestId("Amount")[2]).toHaveTextContent("1.1 DARK");

		expect(backButton()).not.toHaveAttribute("disabled");

		// Go back to form step
		userEvent.click(backButton());

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0.1 DARK"));

		expect(continueButton()).not.toBeDisabled();
		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");

		// Continue to review step
		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		expect(within(screen.getByTestId(reviewStepID)).getAllByTestId("Amount")[0]).toHaveTextContent("1 DARK");
		expect(within(screen.getByTestId(reviewStepID)).getAllByTestId("Amount")[1]).toHaveTextContent("0.1 DARK");
		expect(within(screen.getByTestId(reviewStepID)).getAllByTestId("Amount")[2]).toHaveTextContent("1.1 DARK");

		profile.wallets().forget(arkWallet.id());

		useFeesMock.mockRestore();
		goSpy.mockRestore();
	});

	it("should return to form step by cancelling fee warning", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		selectRecipient();

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);
		userEvent.clear(screen.getByTestId("InputCurrency"));
		await waitFor(() => expect(screen.getByTestId("InputCurrency")).not.toHaveValue());

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "1");

		await waitFor(() => expect(inputElement).toHaveValue("1"));

		await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		// Fee warning
		await expect(screen.findByTestId("FeeWarning__cancel-button")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));
		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
	});

	it.each(["cancel", "continue"])(
		"should update the profile settings when dismissing the fee warning (%s)",
		async (action) => {
			const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;
			history.push(transferURL);

			render(
				<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
					<SendTransfer />
				</Route>,
				{
					history,
					route: transferURL,
				},
			);

			await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

			await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

			selectRecipient();

			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

			selectFirstRecipient();
			await waitFor(() =>
				expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(
					profile.wallets().first().address(),
				),
			);

			// Amount
			userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
			await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

			// Memo
			userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
			await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

			// Fee
			userEvent.click(
				within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
			);

			const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

			inputElement.select();
			userEvent.paste(inputElement, "1");

			await waitFor(() => expect(inputElement).toHaveValue("1"));

			await waitFor(() => expect(continueButton()).not.toBeDisabled());

			userEvent.click(continueButton());

			// Review Step
			await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

			expect(continueButton()).not.toBeDisabled();

			userEvent.click(continueButton());

			const profileSpy = vi.spyOn(profile.settings(), "set").mockImplementation(vi.fn());

			// Fee warning
			await expect(screen.findByTestId("FeeWarning__suppressWarning-toggle")).resolves.toBeVisible();

			userEvent.click(screen.getByTestId("FeeWarning__suppressWarning-toggle"));
			userEvent.click(screen.getByTestId(`FeeWarning__${action}-button`));

			expect(profileSpy).toHaveBeenCalledWith(Contracts.ProfileSetting.DoNotShowFeeWarning, true);

			await expect(
				screen.findByTestId(action === "cancel" ? formStepID : "AuthenticationStep"),
			).resolves.toBeVisible();

			profileSpy.mockRestore();
		},
	);

	it.each([
		["high", "1"],
		["low", "0.000001"],
	])("should send a single transfer with a %s fee by confirming the fee warning", async (_, fee) => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, fee);

		await waitFor(() => expect(inputElement).toHaveValue(fee));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		// Fee warning
		await expect(screen.findByTestId("FeeWarning__continue-button")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

		// Auth Step
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), getDefaultWalletMnemonic());
		await waitFor(() =>
			expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(getDefaultWalletMnemonic()),
		);

		// Summary Step (skip ledger confirmation for now)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());
		userEvent.click(sendButton());

		await waitFor(() => expect(screen.getByTestId("TransactionPending")));

		await act(() => vi.runOnlyPendingTimers());

		await waitFor(() => expect(screen.getByTestId("TransactionSuccessful")).toHaveTextContent("8f913b6b71"));

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = vi.spyOn(history, "push");
		userEvent.click(backToWalletButton());

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		pushSpy.mockRestore();
	});
});
