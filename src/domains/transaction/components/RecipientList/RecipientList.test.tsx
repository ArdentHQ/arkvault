/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { RecipientList } from "./RecipientList";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

const recipients: RecipientItem[] = [
	{
		address: "FJKDSALJFKASLJFKSDAJD333FKFKDSAJFKSAJFKLASJKDFJ",
		alias: "Recipient 1",
		amount: 100,
	},
	{
		address: "AhFJKDSALJFKASLJFKSDEAJ333FKFKDSAJFKSAJFKLASJKDFJ",
		alias: "Recipient 2",
		amount: 100,
	},
	{
		address: "FAhFJKDSALJFKASLJFKSFDAJ333FKFKDSAJFKSAJFKLASJKDFJ",
		alias: "Recipient 3",
		amount: 100,
	},
	{
		address: "FAhFJKDSALJFKASLJFKSFDAJ333FKFKDSAJFKSAJFKLASJKDFJ",
		amount: 100,
	},
];

describe("RecipientList", () => {
	let profile: Contracts.IProfile;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should render editable", () => {
		const { container } = render(
			<RecipientList
				isEditable={true}
				recipients={recipients}
				showAmount={false}
				showExchangeAmount={false}
				ticker="ARK"
			/>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toMatchSnapshot();
	});

	it("should render condensed variant", () => {
		const { container } = render(
			<RecipientList
				isEditable={true}
				recipients={recipients}
				showAmount={false}
				showExchangeAmount={false}
				ticker="ARK"
				variant="condensed"
			/>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);
		expect(container).toMatchSnapshot();
	});

	it("should render non-editable", () => {
		const { container } = render(
			<RecipientList
				isEditable={false}
				recipients={recipients}
				showAmount={false}
				showExchangeAmount={false}
				ticker="ARK"
			/>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toMatchSnapshot();
	});

	it("should render without amount column", () => {
		const { container } = render(
			<RecipientList
				isEditable={false}
				recipients={recipients}
				showAmount={true}
				showExchangeAmount={false}
				ticker="ARK"
			/>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(container).toMatchSnapshot();
	});

	it("should conditionally disable remove button", () => {
		const { container } = render(
			<RecipientList
				disableButton={(address: string) => address === recipients[0].address}
				isEditable={true}
				recipients={recipients}
				showAmount={false}
				showExchangeAmount={false}
				ticker="ARK"
			/>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		const removeButtons = screen.getAllByTestId("recipient-list__remove-recipient");

		for (const [index, removeButton] of removeButtons.entries()) {
			if (index) {
				expect(removeButton).not.toBeDisabled();
			} else {
				expect(removeButton).toBeDisabled();
			}
		}

		expect(container).toMatchSnapshot();
	});

	it("should call onRemove callback to remove recipient", async () => {
		const onRemove = vi.fn();

		render(
			<RecipientList
				onRemove={onRemove}
				recipients={recipients}
				isEditable={true}
				ticker="ARK"
				showAmount={false}
				showExchangeAmount={false}
			/>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		const removeButton = screen.getAllByTestId("recipient-list__remove-recipient");

		expect(removeButton[0]).toBeInTheDocument();

		await userEvent.click(removeButton[0]);

		expect(onRemove).toHaveBeenCalledWith(0);
	});

	it("should not call onRemove callback if not provided", async () => {
		const onRemove = vi.fn();

		render(
			<RecipientList
				recipients={recipients}
				isEditable={true}
				ticker="ARK"
				showAmount={false}
				showExchangeAmount={false}
			/>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		const removeButton = screen.getAllByTestId("recipient-list__remove-recipient");

		expect(removeButton[0]).toBeInTheDocument();

		userEvent.click(removeButton[0]);

		expect(onRemove).not.toHaveBeenCalled();
	});

	it("should render exchange amount", async () => {
		const exchangeMock = vi.spyOn(profile.exchangeRates(), "exchange").mockReturnValue(5);
		const exchangeCurrencyMock = vi.spyOn(profile.settings(), "get").mockReturnValue("USD");

		const recipients: RecipientItem[] = [
			{
				address: "FJKDSALJFKASLJFKSDAJD333FKFKDSAJFKSAJFKLASJKDFJ",
				alias: "Recipient 1",
				amount: 100,
			},
		];

		render(
			<RecipientList
				recipients={recipients}
				showAmount={true}
				isEditable={true}
				ticker="ARK"
				showExchangeAmount={true}
			/>,
			{
				route: `/profiles/${profile.id()}`,
				withProviders: true,
			},
		);

		expect(screen.getByText("$5.00")).toBeInTheDocument();

		exchangeMock.mockRestore();
		exchangeCurrencyMock.mockRestore();
	});
});
