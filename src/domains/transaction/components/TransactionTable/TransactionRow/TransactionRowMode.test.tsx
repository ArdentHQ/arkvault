import React from "react";

import { BaseTransactionRowMode, TransactionRowMode } from "./TransactionRowMode";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { render, screen } from "@/utils/testing-library";

describe("TransactionRowMode", () => {
	it("should render default icon", () => {
		render(<TransactionRowMode transaction={TransactionFixture} />);

		expect(screen.getByTestId("TransactionRowMode")).toHaveTextContent("sent.svg");
		expect(screen.getByTestId("Avatar")).toBeInTheDocument();
	});

	it("should render sent icon", () => {
		render(<TransactionRowMode transaction={{ ...TransactionFixture, isSent: () => true }} />);

		expect(screen.getByTestId("TransactionRowMode")).toHaveTextContent("sent.svg");
	});

	it("should render received icon", () => {
		render(<TransactionRowMode transaction={{ ...TransactionFixture, isSent: () => false }} />);

		expect(screen.getByTestId("TransactionRowMode")).toHaveTextContent("received.svg");
	});

	it("should render return icon", () => {
		const { rerender } = render(
			<TransactionRowMode transaction={{ ...TransactionFixture, isReturn: () => true }} />,
		);

		expect(screen.getByTestId("TransactionRowMode")).toHaveTextContent("return.svg");

		rerender(
			<TransactionRowMode
				transaction={{ ...TransactionFixture, isReturn: () => true, type: () => "multiPayment" }}
			/>,
		);

		expect(screen.getByTestId("TransactionRowMode")).toHaveTextContent("return.svg");
	});

	it("should not render return icon if sender address is not the transactions wallet address", () => {
		const { rerender } = render(
			<TransactionRowMode transaction={{ ...TransactionFixture, isReturn: () => true }} />,
		);

		expect(screen.getByTestId("TransactionRowMode")).toHaveTextContent("return.svg");

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

		expect(screen.getByTestId("TransactionRowMode")).not.toHaveTextContent("return.svg");
		expect(screen.getByTestId("TransactionRowMode")).toHaveTextContent("received.svg");
	});
});

describe("BaseTransactionRowMode", () => {
	it("should render", () => {
		render(<BaseTransactionRowMode type="transfer" transaction={TransactionFixture} />);

		expect(screen.getByTestId("TransactionRowMode")).toHaveTextContent("received.svg");
	});

	it("should render compact", () => {
		render(<BaseTransactionRowMode type="transfer" transaction={TransactionFixture} isCompact />);

		expect(screen.getByTestId("TransactionRowMode")).toHaveTextContent("received.svg");
	});
});
