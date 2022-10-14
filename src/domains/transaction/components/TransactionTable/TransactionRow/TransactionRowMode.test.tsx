import React from "react";

import { BaseTransactionRowMode, TransactionRowMode } from "./TransactionRowMode";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { getSvgById, render, screen } from "@/utils/testing-library";

describe("TransactionRowMode", () => {
	it("should render default icon", () => {
		render(<TransactionRowMode transaction={TransactionFixture} />);

		expect(getSvgById(screen.getByTestId("TransactionRowMode"), "sent")).toBeInTheDocument();

		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
	});

	it("should render sent icon", () => {
		render(<TransactionRowMode transaction={{ ...TransactionFixture, isSent: () => true }} />);

		expect(getSvgById(screen.getByTestId("TransactionRowMode"), "sent")).toBeInTheDocument();
	});

	it("should render received icon", () => {
		render(<TransactionRowMode transaction={{ ...TransactionFixture, isSent: () => false }} />);

		expect(getSvgById(screen.getByTestId("TransactionRowMode"), "received")).toBeInTheDocument();
	});

	it("should render return icon", () => {
		const { rerender } = render(
			<TransactionRowMode transaction={{ ...TransactionFixture, isReturn: () => true }} />,
		);

		expect(getSvgById(screen.getByTestId("TransactionRowMode"), "return")).toBeInTheDocument();

		rerender(
			<TransactionRowMode
				transaction={{ ...TransactionFixture, isReturn: () => true, type: () => "multiPayment" }}
			/>,
		);

		expect(getSvgById(screen.getByTestId("TransactionRowMode"), "return")).toBeInTheDocument();
	});

	it("should not render return icon if sender address is not the transactions wallet address", () => {
		const { rerender } = render(
			<TransactionRowMode transaction={{ ...TransactionFixture, isReturn: () => true }} />,
		);

		expect(getSvgById(screen.getByTestId("TransactionRowMode"), "return")).toBeInTheDocument();

		rerender(
			<TransactionRowMode
				transaction={{
					...TransactionFixture,
					isReturn: () => true,
					isSent: () => false,
					recipients: () => [
						{ address: "not-wallet-address", amount: 1 },
						{ address: TransactionFixture.recipient(), amount: 1 },
					],
					sender: () => "not-wallet-address",
					type: () => "multiPayment",
				}}
			/>,
		);

		expect(getSvgById(screen.getByTestId("TransactionRowMode"), "return")).not.toBeInTheDocument();
		expect(getSvgById(screen.getByTestId("TransactionRowMode"), "received")).toBeInTheDocument();
	});
});

describe("BaseTransactionRowMode", () => {
	it("should render", () => {
		render(<BaseTransactionRowMode type="transfer" transaction={TransactionFixture} />);

		expect(getSvgById(screen.getByTestId("TransactionRowMode"), "received")).toBeInTheDocument();
	});

	it("should render compact", () => {
		render(<BaseTransactionRowMode type="transfer" transaction={TransactionFixture} isCompact />);

		expect(getSvgById(screen.getByTestId("TransactionRowMode"), "received")).toBeInTheDocument();
	});
});
