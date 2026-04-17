import React from "react";
import { render } from "@/utils/testing-library";
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
});
