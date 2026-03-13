import { env, getDefaultProfileId, render, screen, waitFor, within } from "@/utils/testing-library";
import React from "react";
import { SendTransferSidePanel } from "./SendTransferSidePanel";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import userEvent from "@testing-library/user-event";
import * as ReactRouter from "react-router";
import { afterAll } from "vitest";

import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

let profile: any;
let useSearchParamsMock;

const selectedAsset = "ARK";
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
	await userEvent.click(within(container).getAllByTestId("SelectDropdown__input")[0]);
	await waitFor(() => {
		expect(screen.getByTestId(`SelectDropdown__option--${index}`)).toBeInTheDocument();
	});
	await userEvent.click(screen.getByTestId(`SelectDropdown__option--${index}`));
};

const selectFirstSenderAddress = async () => selectNthSenderAddress(0);

const setupTokenSelection = async (index: number, tokenName: string) => {
	const dropdowns = screen.getAllByTestId("SelectDropdown__input");
	const tokenSelection = dropdowns[index];

	if (!tokenSelection) {
		return;
	}

	const user = userEvent.setup();
	await user.clear(tokenSelection);
	await userEvent.paste(tokenName);
	await userEvent.click(screen.getAllByTestId("select-list__input")[index]);

	await waitFor(() => {
		expect(tokenSelection).toHaveValue(tokenName);
	});
};

describe("SendTransferSidePanel Fee Handling", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
		useSearchParamsMock = vi
			.spyOn(ReactRouter, "useSearchParams")
			.mockReturnValue([new URLSearchParams(), vi.fn()]);

		const fixtureData = Fixtures.ByContractAddress.data;
		const walletTokenData = Fixtures.ByWalletAddress.data[0];

		profile
			.wallets()
			.first()
			.tokens()
			.create({
				token: new TokenDTO(fixtureData),
				walletToken: new WalletTokenDTO(walletTokenData),
			});

		const tokensCollection = new WalletTokenCollection(
			[
				new WalletToken({
					network: profile.activeNetwork(),
					profile,
					token: new TokenDTO(fixtureData),
					walletToken: new WalletTokenDTO(walletTokenData),
				}),
			],
			{
				last: undefined,
				next: 0,
				prev: undefined,
				self: undefined,
			},
		);

		vi.spyOn(profile.tokens(), "selected").mockReturnValue(tokensCollection);
	});

	afterAll(() => {
		useSearchParamsMock.mockRestore();
	});

	it("should recalculate amount when fee changes and send all is selected", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} tokenContractAddress={selectedAsset} />, {
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
		await setupTokenSelection(2, selectedAsset);

		await userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"));

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

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
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} tokenContractAddress={selectedAsset} />, {
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
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} tokenContractAddress={selectedAsset} />, {
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
});
