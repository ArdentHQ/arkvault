import React from "react";
import {RecipientItem} from "./RecipientsModal.contracts";
import {RecipientsTable} from "./RecipientsTable";
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

describe("RecipientsTable", () => {
	it("should render", () => {
		const ticker = "DARK";
		render(<RecipientsTable recipients={recipients} ticker={ticker} />);

		expect(screen.getByTestId("TableWrapper")).toBeInTheDocument();
		expect(screen.getByText(recipients[0].alias)).toBeInTheDocument();
		expect(screen.getByText(recipients[0].amount + ` ${ticker}`)).toBeInTheDocument();
	});
});
