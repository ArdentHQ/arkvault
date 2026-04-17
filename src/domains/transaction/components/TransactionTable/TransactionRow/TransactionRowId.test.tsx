import React from "react";
import { render, screen } from "@/utils/testing-library";
import { TransactionRowId } from "./TransactionRowId";
import { TransactionFixture } from "@/tests/fixtures/transactions";

describe("TransactionRowId", () => {
	it("should render pending transaction without block hash", () => {
		const transaction = {
			...TransactionFixture,
			isSuccess: () => false,
			blockHash: () => "",
			hash: () => "0xabc123",
			explorerLink: () => "https://explorer.test/tx/0x123",
		} as any;

		render(<TransactionRowId transaction={transaction} />);

		expect(screen.getByTestId("TransactionRow__id")).toBeInTheDocument();
	});
});
