import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { AddressService } from "@/app/lib/mainsail/address.service";
import { SendTransferSidePanel } from "./SendTransferSidePanel";
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

const formStepID = "SendTransfer__form-step";
const reviewStepID = "SendTransfer__review-step";
const recipientAddButton = "AddRecipient__add-button";

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let resetProfileNetworksMock: () => void;

const selectNthSenderAddress = async (index = 0) => {
	const container = screen.getByTestId("sender-address");
	await userEvent.click(within(container).getByTestId("SelectDropdown__input"));

	const elementTestId = `SelectDropdown__option--${index}`;

	await waitFor(() => {
		expect(screen.getByTestId(elementTestId)).toBeInTheDocument();
	});

	await userEvent.click(screen.getByTestId(elementTestId));
};

const selectFirstSenderAddress = async () => selectNthSenderAddress(0);

const continueButton = () => screen.getByTestId("SendTransfer__continue-button");

describe("SendTransferSidePanel MultiPayment", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		vi.spyOn(AddressService.prototype, "validate").mockReturnValue(true);

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterAll(() => {
		vi.restoreAllMocks();
		resetProfileNetworksMock();
	});

	it("should select two recipients", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${getDefaultProfileId()}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await selectFirstSenderAddress();

		await userEvent.click(screen.getByText(transactionTranslations.MULTIPLE));

		await expect(screen.findByTestId(recipientAddButton)).resolves.toBeVisible();

		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);
		await userEvent.type(screen.getAllByTestId("SelectDropdown__input")[1], profile.wallets().first().address());
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));
		await waitFor(() => expect(screen.getByTestId(recipientAddButton)).toBeEnabled());
		await userEvent.click(screen.getByTestId(recipientAddButton));
		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(1));

		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);
		await userEvent.type(screen.getAllByTestId("SelectDropdown__input")[1], profile.wallets().last().address());
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");

		await waitFor(() => expect(screen.getByTestId(recipientAddButton)).toBeEnabled());
		await userEvent.click(screen.getByTestId(recipientAddButton));

		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(2));
	});

	it("should prevent sending when amount + fee exceeds balance", async () => {
		const walletSpy = vi.spyOn(wallet, "balance").mockReturnValue(50);

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${getDefaultProfileId()}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await selectFirstSenderAddress();

		await userEvent.click(screen.getByText(transactionTranslations.MULTIPLE));

		await expect(screen.findByTestId(recipientAddButton)).resolves.toBeVisible();

		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);
		await userEvent.type(screen.getAllByTestId("SelectDropdown__input")[1], profile.wallets().first().address());
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "24");

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("24"));
		await waitFor(() => expect(screen.getByTestId(recipientAddButton)).toBeEnabled());
		await userEvent.click(screen.getByTestId(recipientAddButton));
		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(1));

		await userEvent.clear(screen.getAllByTestId("SelectDropdown__input")[1]);
		await userEvent.type(screen.getAllByTestId("SelectDropdown__input")[1], profile.wallets().last().address());
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "26");

		await waitFor(() => expect(screen.getByTestId(recipientAddButton)).toBeEnabled());
		await userEvent.click(screen.getByTestId(recipientAddButton));
		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(2));

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				"data-errortext",
				"The current balance does not cover the transaction amount plus fees.",
			);
		});

		walletSpy.mockRestore();
	});
});
