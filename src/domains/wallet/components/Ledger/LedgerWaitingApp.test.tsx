import userEvent from "@testing-library/user-event";
import React from "react";

import { LedgerWaitingApp, LedgerWaitingAppContent } from "./LedgerWaitingApp";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("LedgerWaitingApp", () => {
	it("should call the onClose callback if given", async () => {
		const onClose = vi.fn();

		render(<LedgerWaitingApp isOpen={true} coinName="ARK" onClose={onClose} />);

		const closeButton = await screen.findByTestId("Modal__close-button");
		expect(closeButton).toBeInTheDocument();

		userEvent.click(closeButton);

		await waitFor(() => {
			expect(onClose).toHaveBeenCalled();
		});
	});

	it("should render with custom subtitle", () => {
		const subtitle = "Connect your Ledger Nano S and confirm input";
		render(<LedgerWaitingApp isOpen={true} coinName="ARK" subtitle={subtitle} />);

		expect(screen.getByText(subtitle)).toBeInTheDocument();
	});
});

describe("LedgerDeviceErrorContent", () => {
	it("should display loading indicator", () => {
		render(<LedgerWaitingAppContent coinName="ARK" subject="message" />);

		expect(screen.getByTestId("LedgerWaitingApp-loading_message")).toBeInTheDocument();
	});
});
