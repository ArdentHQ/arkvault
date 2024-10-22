import React from "react";
import { RecipientItem } from "../RecipientList/RecipientList.contracts";
import { render, screen } from "../../../../utils/testing-library";
import {RecipientsList} from "./RecipientsList";

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
];

describe("RecipientsList", () => {
	it("should render", () => {
		render(<RecipientsList recipients={recipients} ticker="DARK"/>);

		expect(screen.getAllByTestId("RecipientsListItem").length).toBe(recipients.length)
	});
});
