/* eslint-disable @typescript-eslint/require-await */
import "jest-extended";

import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SendTransfer } from "./SendTransfer";
import { LedgerProvider } from "@/app/contexts";
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

jest.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("SendTransfer MultiPayment", () => {
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
		const profileSetCoinMock = jest.spyOn(profile.coins(), "set").mockReturnValue(wallet.coin());

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		const coinValidateMock = jest.spyOn(wallet.coin().address(), "validate").mockResolvedValue(true);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());
		});

		// Select multiple type
		userEvent.click(screen.getByText(transactionTranslations.MULTIPLE));

		// 1st recipient.
		userEvent.paste(screen.getAllByTestId("SelectDropdown__input")[1], profile.wallets().first().address());
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		userEvent.click(screen.getByTestId("AddRecipient__add-button"));

		// 2nd recipient.
		userEvent.paste(screen.getAllByTestId("SelectDropdown__input")[1], profile.wallets().last().address());
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");

		userEvent.click(screen.getByTestId("AddRecipient__add-button"));

		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(2));

		coinValidateMock.mockRestore();
		profileSetCoinMock.mockRestore();
	});
});
