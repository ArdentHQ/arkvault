/* eslint-disable @typescript-eslint/require-await */
import "jest-extended";

import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { SendTransfer } from "./SendTransfer";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const backButton = () => screen.getByTestId("StepNavigation__back-button");

const ARKDevnetOptionId = "NetworkOption-ARK-ark.devnet";
const networkStepID = "SendTransfer__network-step";
const formStepID = "SendTransfer__form-step";
const ARKDevnet = "ARK Devnet";
const transferURL = `/profiles/${getDefaultProfileId()}/send-transfer`;

const history = createHashHistory();

jest.setTimeout(10_000);

describe("SendTransfer Network Selection", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		// Profile needs a wallet on the mainnet network to show network selection
		// step.
		const { wallet: arkMainnetWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.mainnet",
		});
		profile.wallets().push(arkMainnetWallet);

		nock("https://ark-test.arkvault.io")
			.get("/api/transactions?address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")
			.reply(200, require("tests/fixtures/coins/ark/devnet/transactions.json"))
			.get("/api/transactions?page=1&limit=20&senderId=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")
			.reply(200, { data: [], meta: {} })
			.get("/api/transactions/8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877")
			.reply(200, () => require("tests/fixtures/coins/ark/devnet/transactions.json"));
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should trigger network connection warning when selecting unsynced wallet", async () => {
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId(networkStepID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(ARKDevnetOptionId));
		await waitFor(() => expect(screen.getByTestId(ARKDevnetOptionId)).toHaveAttribute("aria-label", ARKDevnet));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("SearchWalletListItem__select-0"));
		await waitFor(() =>
			expect(screen.getByTestId("SelectAddress__input")).toHaveValue(profile.wallets().first().address()),
		);
	});

	it("should select cryptoasset", async () => {
		history.push(transferURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(networkStepID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(ARKDevnetOptionId));

		await expect(screen.findByTestId(ARKDevnetOptionId)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId(ARKDevnetOptionId)).toHaveAttribute("aria-label", ARKDevnet));

		expect(asFragment()).toMatchSnapshot();
	});

	it.skip("should reset fields when network changed", async () => {
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

		userEvent.click(screen.getByTestId(ARKDevnetOptionId));
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(ARKDevnet));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(screen.getByTestId("SelectNetworkInput__network")).toHaveAttribute("aria-label", ARKDevnet);

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Previous step
		userEvent.click(backButton());

		await expect(screen.findByTestId(networkStepID)).resolves.toBeVisible();

		// Change network
		// Unselect
		userEvent.click(screen.getByTestId(ARKDevnetOptionId));
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).not.toHaveValue());
		// Select
		userEvent.click(screen.getByTestId(ARKDevnetOptionId));
		await waitFor(() => expect(screen.getByTestId("SelectNetworkInput__input")).toHaveValue(ARKDevnet));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		// Next step
		userEvent.click(continueButton());

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Memo
		expect(screen.getByTestId("Input__memo")).not.toHaveValue();

		// Fee
		expect(screen.getAllByRole("radio")[0]).not.toBeChecked();
	});

	it("should select a cryptoasset and select sender without wallet id param", async () => {
		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(networkStepID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(ARKDevnetOptionId));
		await waitFor(() => expect(screen.getByTestId(ARKDevnetOptionId)).toHaveAttribute("aria-label", ARKDevnet));
		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Select sender
		userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-1");

		userEvent.click(firstAddress);

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});

		expect(container).toMatchSnapshot();
	});
});
