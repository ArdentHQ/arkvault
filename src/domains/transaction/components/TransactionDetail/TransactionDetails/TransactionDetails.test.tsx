import React from "react";
import { screen, renderResponsive, render } from "@/utils/testing-library";
import { TransactionDetails } from "./TransactionDetails";
import { TransactionFixture } from "@/tests/fixtures/transactions";

describe("TransactionDetails", () => {
	it.each(["sm", "md", "lg"])("should render in %s", (breakpoint: string) => {
		renderResponsive(<TransactionDetails transaction={{ ...TransactionFixture }} />, breakpoint);

		expect(screen.getAllByTestId("DetailLabelText")).toHaveLength(4);
	});

	it("should render without block id", () => {
		render(<TransactionDetails transaction={{ ...TransactionFixture, blockId: () => null }} />);

		expect(screen.queryByText(TransactionFixture.blockId())).not.toBeInTheDocument();
	});
});
