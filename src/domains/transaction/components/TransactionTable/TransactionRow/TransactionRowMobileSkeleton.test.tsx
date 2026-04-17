import React from "react";
import { render, screen } from "@/utils/testing-library";
import { TransactionRowMobileSkeleton } from "./TransactionRowMobileSkeleton";

describe("TransactionRowMobileSkeleton", () => {
	it("should render skeleton with hideSender false", () => {
		const { container } = render(<TransactionRowMobileSkeleton hideSender={false} />);
		expect(container).toBeInTheDocument();
	});

	it("should render skeleton with hideSender true", () => {
		const { container } = render(<TransactionRowMobileSkeleton hideSender={true} />);
		expect(container).toBeInTheDocument();
	});

	it("should render skeleton with default hideSender (undefined)", () => {
		const { container } = render(<TransactionRowMobileSkeleton />);
		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("TransactionRow__skeleton-sender")).toBeInTheDocument();
	});
});
