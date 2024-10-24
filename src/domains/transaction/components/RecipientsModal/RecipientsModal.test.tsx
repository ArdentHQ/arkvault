import React from "react";
import { RecipientItem } from "./RecipientsModal.contracts";
import { screen } from "@testing-library/react";
import { RecipientsModal } from "./RecipientsModal";
import { renderResponsive } from "@/utils/testing-library";

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

describe("RecipientsModal", () => {
	it("should render `RecipientsLists` in `sm` screen", () => {
		renderResponsive(
			<RecipientsModal recipients={recipients} ticker="DARK" isOpen={true} onClose={vi.fn()} />,
			"sm",
		);

		expect(screen.getAllByTestId("RecipientsListItem").length).toBeTruthy();
		expect(screen.queryByTestId("TableWrapper")).not.toBeInTheDocument();
	});

	it("should render `RecipientsTable` in `lg` screen", () => {
		renderResponsive(
			<RecipientsModal recipients={recipients} ticker="DARK" isOpen={true} onClose={vi.fn()} />,
			"lg",
		);

		expect(screen.getByTestId("TableWrapper")).toBeInTheDocument();
		expect(screen.queryAllByTestId("RecipientsListItem").length).toBe(0);
	});

	it("should show number of recipients in the modal title", () => {
		renderResponsive(
			<RecipientsModal recipients={recipients} ticker="DARK" isOpen={true} onClose={vi.fn()} />,
			"sm",
		);

		expect(screen.getByTestId("RecipientsModal--RecipientsCount")).toHaveTextContent(recipients.length);
	});
});
