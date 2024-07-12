/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
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
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let mockProfileNetworkReset: () => void;

const formStepID = "SendTransfer__form-step";

const history = createHashHistory();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("SendTransfer MultiPayment", () => {
	const recipientAddButton = "AddRecipient__add-button";

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		mockProfileNetworkReset = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterAll(() => {
		mockProfileNetworkReset();
	});

	it("should select two recipients", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;
		const profileSetCoinMock = vi.spyOn(profile.coins(), "set").mockReturnValue(wallet.coin());

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

		const coinValidateMock = vi.spyOn(wallet.coin().address(), "validate").mockResolvedValue(true);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());
		});

		// Select multiple type
		userEvent.click(screen.getByText(transactionTranslations.MULTIPLE));

		await expect(screen.findByTestId(recipientAddButton)).resolves.toBeVisible();

		// 1st recipient.
		userEvent.paste(screen.getAllByTestId("SelectDropdown__input")[0], profile.wallets().first().address());
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));
		await waitFor(() => expect(screen.getByTestId(recipientAddButton)).toBeEnabled());

		userEvent.click(screen.getByTestId(recipientAddButton));
		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(1));

		// 2nd recipient.
		userEvent.paste(screen.getAllByTestId("SelectDropdown__input")[0], profile.wallets().last().address());
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");

		await waitFor(() => expect(screen.getByTestId(recipientAddButton)).toBeEnabled());
		userEvent.click(screen.getByTestId(recipientAddButton));

		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(2));

		coinValidateMock.mockRestore();
		profileSetCoinMock.mockRestore();
	});
});
