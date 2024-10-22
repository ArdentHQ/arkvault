import React from "react";
import {RecipientsList} from "./RecipientsList";
import {RecipientItem} from "./RecipientsModal.contracts";
import {render, screen} from "@testing-library/react";

const recipients: RecipientItem[] = [
	{
		address: "FJKDSALJFKASLJFKSDAJD333FKFKDSAJFKSAJFKLASJKDFJ",
		alias: "Recipient 1",
		amount: 150,
	},
	{
		address: "AhFJKDSALJFKASLJFKSDEAJ333FKFKDSAJFKSAJFKLASJKDFJ",
		alias: "Recipient 2",
		amount: 100,
	},
];

describe("RecipientsList", () => {
	it("should render", () => {
		const ticker = "DARK";

		render(<RecipientsList recipients={recipients} ticker={ticker} />);

		expect(screen.getAllByTestId("RecipientsListItem").length).toBe(recipients.length)
		expect(screen.getByText(recipients[0].alias)).toBeInTheDocument();
		expect(screen.getByText(recipients[0].amount + ` ${ticker}`)).toBeInTheDocument();
	});
});
