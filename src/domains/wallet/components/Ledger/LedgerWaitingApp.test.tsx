import userEvent from "@testing-library/user-event";
import React from "react";

import { render, screen } from "@/utils/testing-library";

import { LedgerWaitingApp } from "./LedgerWaitingApp";

describe("LedgerWaitingApp", () => {
	it("should call the onClose callback if given", async () => {
		const onClose = vi.fn();

		render(<LedgerWaitingApp isOpen={true} coinName="ARK" onClose={onClose} />);

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onClose).toHaveBeenCalledWith();
	});

	it("should render with custom subtitle", () => {
		const subtitle = "Connect your Ledger Nano S and confirm input";
		render(<LedgerWaitingApp isOpen={true} coinName="ARK" subtitle={subtitle} />);

		expect(screen.getByText(subtitle)).toBeInTheDocument();
	});
});
