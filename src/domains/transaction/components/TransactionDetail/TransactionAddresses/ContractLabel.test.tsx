import React from "react";
import { render, screen } from "@/utils/testing-library";
import { ContractLabel } from "./TransactionRecipient";

describe("ContractLabel", () => {
	it("should render contract label", () => {
		render(<ContractLabel />);

		expect(screen.getByTestId("TransactionRow__type")).toBeInTheDocument();
		expect(screen.getByText("Contract")).toBeInTheDocument();
	});
});
