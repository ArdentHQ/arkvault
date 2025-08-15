/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { AddressService } from "@/app/lib/mainsail/address.service";
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

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("SendTransfer MultiPayment", () => {
	const recipientAddButton = "AddRecipient__add-button";

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		vi.spyOn(AddressService.prototype, "validate").mockReturnValue(true);

		mockProfileNetworkReset = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterAll(() => {
		mockProfileNetworkReset();
	});

	it("should select two recipients", async () => {
		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());
		});

		// Select multiple type
		await userEvent.click(screen.getByText(transactionTranslations.MULTIPLE));

		await expect(screen.findByTestId(recipientAddButton)).resolves.toBeVisible();

		// 1st recipient.
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);
		await userEvent.type(screen.getAllByTestId("SelectDropdown__input")[0], profile.wallets().first().address());
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));
		await waitFor(() => expect(screen.getByTestId(recipientAddButton)).toBeEnabled());

		userEvent.click(screen.getByTestId(recipientAddButton));
		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(1));

		// 2nd recipient.
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);
		await userEvent.type(screen.getAllByTestId("SelectDropdown__input")[0], profile.wallets().last().address());
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");

		await waitFor(() => expect(screen.getByTestId(recipientAddButton)).toBeEnabled());
		await userEvent.click(screen.getByTestId(recipientAddButton));

		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(2));
	});

	it("should prevent sending when amount + fee exceeds balance", async () => {
		const walletSpy = vi.spyOn(wallet, "balance").mockReturnValue(50);

		const transferURL = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-transfer`;

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());
		});

		// Select multiple type
		await userEvent.click(screen.getByText(transactionTranslations.MULTIPLE));

		await expect(screen.findByTestId(recipientAddButton)).resolves.toBeVisible();

		// 1st recipient.
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);
		await userEvent.type(screen.getAllByTestId("SelectDropdown__input")[0], profile.wallets().first().address());
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "24");

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("24"));
		await waitFor(() => expect(screen.getByTestId(recipientAddButton)).toBeEnabled());

		await userEvent.click(screen.getByTestId(recipientAddButton));
		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(1));

		// 2nd recipient.
		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[0]);
		await userEvent.type(screen.getAllByTestId("SelectDropdown__input")[0], profile.wallets().last().address());
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "26");

		await waitFor(() => expect(screen.getByTestId(recipientAddButton)).toBeEnabled());
		await userEvent.click(screen.getByTestId(recipientAddButton));

		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(2));

		const continueButton = () => screen.getByTestId("StepNavigation__continue-button");

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());

		await expect(screen.findByTestId("SendTransfer__review-step")).resolves.toBeVisible();

		// Should display whole amount
		await expect(screen.findByText(/50 ARK/)).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				"data-errortext",
				"The current balance does not cover the transaction amount plus fees.",
			);
		});

		walletSpy.mockRestore();
	});
});
