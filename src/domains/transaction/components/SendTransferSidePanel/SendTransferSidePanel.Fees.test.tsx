import {
	env,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	waitFor,
	within,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import React from "react";
import { SendTransferSidePanel } from "./SendTransferSidePanel";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import nodeFeesFixture from "@/tests/fixtures/coins/mainsail/devnet/node-fees.json";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import transactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";
import userEvent from "@testing-library/user-event";

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

let profile: any;
let resetProfileNetworksMock: () => void;

const selectFirstRecipient = () => userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
const selectRecipient = () =>
	userEvent.click(within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"));
const continueButton = () => screen.getByTestId("SendTransfer__continue-button");
const backButton = () => screen.getByTestId("SendTransfer__back-button");

const reviewStepID = "SendTransfer__review-step";
const formStepID = "SendTransfer__form-step";
const authenticationStepID = "AuthenticationStep";
const sendAllID = "AddRecipient__send-all";

const selectNthSenderAddress = async (index = 0) => {
	const container = screen.getByTestId("sender-address");
	await userEvent.click(within(container).getByTestId("SelectDropdown__input"));
	await waitFor(() => {
		expect(screen.getByTestId(`SelectDropdown__option--${index}`)).toBeInTheDocument();
	});
	await userEvent.click(screen.getByTestId(`SelectDropdown__option--${index}`));
};

const selectFirstSenderAddress = async () => selectNthSenderAddress(0);

describe("SendTransferSidePanel Fee Handling", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		server.use(
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/transactions/${transactionFixture.data.hash}`,
				transactionFixture,
			),
			requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", transactionsFixture, {
				query: { address: profile.wallets().first().address() },
			}),
			requestMock("https://ark-live.arkvault.io/api/node/fees", nodeFeesFixture),
		);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should recalculate amount when fee changes and send all is selected", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${getDefaultProfileId()}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await selectFirstSenderAddress();

		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();
		await selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(profile.wallets().first().address()),
		);

		await userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"));

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());
		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000126");

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.AVERAGE));
		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toBeChecked());
		expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0.00012768");

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());
		expect(screen.getAllByRole("radio")[2]).toHaveTextContent("0.0001512");
	});

	it("should keep the selected fee when user steps back", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${getDefaultProfileId()}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();

		await selectRecipient();
		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(profile.wallets().first().address()),
		);

		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "0.01");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("0.01"));

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(authenticationStepID)).resolves.toBeVisible();

		expect(backButton()).not.toBeDisabled();
		await userEvent.click(backButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(authenticationStepID)).resolves.toBeVisible();
	});

	it("should handle fee change", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${getDefaultProfileId()}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();

		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();
		await selectFirstRecipient();

		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "0.01");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("0.01"));

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());
		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000126");

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.AVERAGE));
		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toBeChecked());
		expect(screen.getAllByRole("radio")[1]).toHaveTextContent("0.00012768");

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.FAST));
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());
		expect(screen.getAllByRole("radio")[2]).toHaveTextContent("0.0001512");

		await userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("Input_GasPrice");
		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "1000000000");
		await waitFor(() => expect(inputElement).toHaveValue("1000000000"));
	});
});
