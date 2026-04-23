import React from "react";
import { render, screen } from "@/utils/testing-library";
import { ExchangeTooltip } from "./TransactionRowAmount";

describe("ExchangeTooltip", () => {
	it("should render test network message", () => {
		render(
			<ExchangeTooltip value={100} ticker="ARK" isTestNetwork={true}>
				<span>Test</span>
			</ExchangeTooltip>,
		);

		expect(screen.getByTestId("TransactionAmount__tooltip")).toBeInTheDocument();
	});

	it("should render without test network", () => {
		render(
			<ExchangeTooltip value={100} ticker="ARK" isTestNetwork={false}>
				<span>Test</span>
			</ExchangeTooltip>,
		);

		expect(screen.getByTestId("TransactionAmount__tooltip")).toBeInTheDocument();
	});
});
