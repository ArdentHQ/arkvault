import React from "react";
import { screen, render } from "@/utils/testing-library";
import { TransactionGas } from "./TransactionGas";

describe("TransactionGas", () => {
	it("should render", () => {
		render(<TransactionGas gasLimit={21000} gasUsed={0.01} />);

		expect(screen.getByTestId("TransactionGas")).toBeInTheDocument();
	});

	it("should render with gas limit and gas used", () => {
		render(<TransactionGas gasLimit={21000} gasUsed={0.01} />);

		expect(screen.getAllByText("21,000")).toHaveLength(2);
		expect(screen.getAllByText("0.01")).toHaveLength(2);
	});

	it("should display N/A if gas used is null", () => {
		render(<TransactionGas gasLimit={21000} gasUsed={null} />);

		expect(screen.getAllByText("N/A")).toHaveLength(2);
	});
});
