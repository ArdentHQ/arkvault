import * as useFeesHook from "@/app/hooks/use-fees";

import {
	act,
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	syncFees,
	waitFor,
	within,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { SendTransfer } from "./SendTransfer";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import transactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";
import userEvent from "@testing-library/user-event";
import { signedTransactionMock } from "./SendTransfer.test";
import { BigNumber } from "@/app/lib/helpers";

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(signedTransactionMock);

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

const reviewStepID = "SendTransfer__review-step";
const formStepID = "SendTransfer__form-step";
const authenticationStepID = "AuthenticationStep";
const sendAllID = "AddRecipient__send-all";

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
			coin: "Mainsail",
			network: "mainsail.devnet",
		});
		profile.wallets().push(arkMainnetWallet);

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

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Select sender
		await userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const secondAddress = screen.getByTestId("SearchWalletListItem__select-1");
		await userEvent.click(secondAddress);

		expect(screen.getByText("0.01989216")).toBeInTheDocument();

		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "55");

		await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();

		// Select sender
		await userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");
		await userEvent.click(firstAddress);

		expect(screen.getByText("95.27653252")).toBeInTheDocument();

		await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());
	});

	it("should recalculate amount when fee changes and send all is selected", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		await userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"));

		await userEvent.click(screen.getByTestId(sendAllID));

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000105");

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.AVERAGE));
		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toBeChecked());

		expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0.0001064");

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		expect(screen.getAllByRole("radio")[2]).toHaveTextContent("0.000126");
	});

	it("should keep the selected fee when user steps back", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "0.01");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("0.01"));

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(authenticationStepID)).resolves.toBeVisible();

		expect(backButton()).not.toBeDisabled();

		await userEvent.click(backButton());

		// Step 1 again
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Thw fast fee should still be selected
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		// Go back to step 2 (the fast fee should still be the one used)
		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(authenticationStepID)).resolves.toBeVisible();
	});

	it("should handle fee change", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;

		const { router } = render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		expect(router.state.location.pathname).toBe(transferURL);

		await selectRecipient();

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await selectFirstRecipient();

		// Amount
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "0.01");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("0.01"));

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000105");

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.AVERAGE));
		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toBeChecked());

		expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0.0001064");

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		expect(screen.getAllByRole("radio")[2]).toHaveTextContent("0.000126");

		await userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("Input_GasPrice");

		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "1000000000");

		await waitFor(() => expect(inputElement).toHaveValue("1000000000"));
	});

	it("should correctly handle fees when network's fee type is size", async () => {
		const { wallet: arkWallet } = await profile.walletFactory().generate({
			network: "mainsail.devnet",
		});

		vi.spyOn(arkWallet, "balance").mockReturnValue(10);
		vi.spyOn(arkWallet, "isValidator").mockReturnValue(false);

		profile.wallets().push(arkWallet);

		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${arkWallet.id()}/send-transfer`;

		const useFeesMock = vi.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () =>
				Promise.resolve({
					avg: BigNumber.make(2),
					max: BigNumber.make(3),
					min: BigNumber.make(1),
				}),
			estimateGas: () => Promise.resolve(BigNumber.make(21_000)),
		});

		const { router } = render(<SendTransfer />, {
			route: transferURL,
		});

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(arkWallet.address()));

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		expect(router.state.location.pathname).toBe(transferURL);

		// Select recipient
		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(profile.wallets().first().address()),
		);

		// Set amount
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "0.1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("0.1"));

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Assert that fee initial value is 0 and then it changes to 0.1 when loaded
		await waitFor(() =>
			expect(screen.getAllByRole("radio")[1]).toHaveTextContent("Average(0.000042 ARK)Confirmation Time~8s"),
		);

		expect(within(screen.getByTestId(reviewStepID)).getAllByTestId("Amount")[0]).toHaveTextContent("1 ARK");
		expect(within(screen.getByTestId(reviewStepID)).getAllByTestId("Amount")[1]).toHaveTextContent("0.000021 ARK");
		expect(within(screen.getByTestId(reviewStepID)).getAllByTestId("Amount")[2]).toHaveTextContent("0.000042 ARK");

		profile.wallets().forget(arkWallet.id());

		useFeesMock.mockRestore();
	});

	it.skip("should return to form step by cancelling fee warning", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "0.01");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("0.01"));

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee
		await userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);
		await userEvent.clear(screen.getByTestId("Input_GasPrice"));
		await waitFor(() => expect(screen.getByTestId("Input_GasPrice")).toHaveValue("0"));

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		const inputElement: HTMLInputElement = screen.getByTestId("Input_GasPrice");

		await userEvent.type(inputElement, "6");

		await waitFor(() => expect(inputElement).toHaveValue("6"));

		await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(authenticationStepID)).resolves.toBeVisible();

		// Fee warning
		await expect(screen.findByTestId("FeeWarning__cancel-button")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));
		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
	});

	it.skip.each(["cancel", "continue"])(
		"should update the profile settings when dismissing the fee warning (%s)",
		async (action) => {
			const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;
			render(<SendTransfer />, {
				route: transferURL,
			});

			await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

			await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

			await selectRecipient();

			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

			await selectFirstRecipient();
			await waitFor(() =>
				expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(
					profile.wallets().first().address(),
				),
			);

			// Amount
			await userEvent.type(screen.getByTestId("AddRecipient__amount"), "0.01");
			await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("0.01"));

			expect(continueButton()).not.toBeDisabled();
			await userEvent.click(continueButton());
			await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

			// Fee
			await userEvent.click(
				within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
			);

			const inputElement: HTMLInputElement = screen.getByTestId("Input_GasPrice");

			await userEvent.clear(inputElement);
			await userEvent.type(inputElement, "1");

			await waitFor(() => expect(inputElement).toHaveValue("1"));

			await waitFor(() => expect(continueButton()).not.toBeDisabled());

			await userEvent.click(continueButton());

			// Review Step
			await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

			expect(continueButton()).not.toBeDisabled();

			await userEvent.click(continueButton());

			const profileSpy = vi.spyOn(profile.settings(), "set").mockImplementation(vi.fn());

			// Fee warning
			await expect(screen.findByTestId("FeeWarning__suppressWarning-toggle")).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("FeeWarning__suppressWarning-toggle"));
			await userEvent.click(screen.getByTestId(`FeeWarning__${action}-button`));

			expect(profileSpy).toHaveBeenCalledWith(Contracts.ProfileSetting.DoNotShowFeeWarning, true);

			await expect(
				screen.findByTestId(action === "cancel" ? formStepID : "AuthenticationStep"),
			).resolves.toBeVisible();

			profileSpy.mockRestore();
		},
	);

	it.skip.each([
		["high", "1"],
		["low", "0.000001"],
	])("should send a single transfer with a %s fee by confirming the fee warning", async (_, fee) => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;

		const { container, router } = render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(profile.wallets().first().address()),
		);

		// Amount
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		await userEvent.type(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		await userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("Input_GasPrice");

		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, fee);

		await waitFor(() => expect(inputElement).toHaveValue(fee));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		// Fee warning
		await expect(screen.findByTestId("FeeWarning__continue-button")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

		// Auth Step
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), getDefaultWalletMnemonic());
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
		await userEvent.click(sendButton());

		await waitFor(() => expect(screen.getByTestId("TransactionPending")));

		await act(() => vi.runOnlyPendingTimers());

		await expect(screen.findByText("Transfer")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		await userEvent.click(backToWalletButton());

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/wallets/${wallet.id()}`);
	});
});
