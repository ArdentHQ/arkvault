import React from "react";

import { TransactionRowAmount } from "./TransactionRowAmount";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { render, screen } from "@/utils/testing-library";

describe("TransactionRowAmount", () => {
	it("should show total", () => {
		render(<TransactionRowAmount transaction={{ ...TransactionFixture }} />);

		expect(screen.getByText("- 121 ARK")).toBeInTheDocument();
	});

	it("should show total as currency", () => {
		render(<TransactionRowAmount transaction={{ ...TransactionFixture }} exchangeCurrency="BTC" />);

		expect(screen.getByText("0 BTC")).toBeInTheDocument();
	});

	it("should show as received", () => {
		const { asFragment } = render(
			<TransactionRowAmount transaction={{ ...TransactionFixture, isSent: () => false }} />,
		);

		expect(screen.getByText("+ 121 ARK")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show exchange as tooltip", () => {
		const { rerender } = render(
			<TransactionRowAmount transaction={{ ...TransactionFixture }} exchangeCurrency="BTC" exchangeTooltip />,
		);

		expect(screen.getByTestId("TransactionAmount__tooltip")).toBeInTheDocument();

		rerender(
			<TransactionRowAmount
				transaction={{
					...TransactionFixture,
					wallet: () => ({ ...TransactionFixture.wallet(), network: () => ({ isTest: () => false }) }),
				}}
				exchangeCurrency="BTC"
				exchangeTooltip
			/>,
		);

		expect(screen.getByTestId("TransactionAmount__tooltip")).toBeInTheDocument();

		rerender(
			<TransactionRowAmount
				transaction={{
					...TransactionFixture,
					wallet: () => ({ ...TransactionFixture.wallet(), network: () => ({ isTest: () => false }) }),
				}}
				exchangeCurrency="USD"
				exchangeTooltip
			/>,
		);

		expect(screen.getByTestId("TransactionAmount__tooltip")).toBeInTheDocument();
	});

	it("should render exchange tooltip with formatted currency on main network", () => {
		render(
			<TransactionRowAmount
				transaction={{
					...TransactionFixture,
					wallet: () => ({
						currency: () => "ARK",
						network: () => ({ isTest: () => false }),
					}),
					convertedTotal: () => 1234.56,
				}}
				exchangeCurrency="USD"
				exchangeTooltip
			/>,
		);

		expect(screen.getByTestId("TransactionAmount__tooltip")).toBeInTheDocument();
	});
});
