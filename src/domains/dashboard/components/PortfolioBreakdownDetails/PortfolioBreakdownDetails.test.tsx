import userEvent from "@testing-library/user-event";
import React from "react";
import { PortfolioBreakdownDetails } from "./PortfolioBreakdownDetails";
import { render, renderResponsive, screen } from "@/utils/testing-library";

import { buildTranslations } from "@/app/i18n/helpers";

const translations = buildTranslations();

describe("PortfolioBreakdownDetails", () => {
	it("should render", async () => {
		const onClose = vi.fn();

		const { asFragment } = render(
			<PortfolioBreakdownDetails
				assets={[
					{ amount: 60, convertedAmount: 60, label: "ARK", percent: 60 },
					{ amount: 30, convertedAmount: 30, label: "LSK", percent: 30 },
				]}
				balance={100}
				onClose={onClose}
				exchangeCurrency="USD"
				isOpen={true}
			/>,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(screen.getByText(translations.DASHBOARD.PORTFOLIO_BREAKDOWN_DETAILS.TITLE)).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should render responsive", async () => {
		const onClose = vi.fn();

		const { asFragment } = renderResponsive(
			<PortfolioBreakdownDetails
				assets={[
					{ amount: 60, convertedAmount: 60, label: "ARK", percent: 60 },
					{ amount: 30, convertedAmount: 30, label: "LSK", percent: 30 },
					{ amount: 10, convertedAmount: 10, label: "SOL", percent: 10 },
				]}
				balance={100}
				onClose={onClose}
				exchangeCurrency="USD"
				isOpen={true}
			/>,
			"xs",
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(screen.getByText(translations.DASHBOARD.PORTFOLIO_BREAKDOWN_DETAILS.TITLE)).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should render with other group", () => {
		const onClose = vi.fn();

		const { asFragment } = render(
			<PortfolioBreakdownDetails
				assets={[
					{ amount: 60, convertedAmount: 60, label: "ARK", percent: 60 },
					{ amount: 30, convertedAmount: 30, label: "LSK", percent: 30 },

					// grouped
					{ amount: 2, convertedAmount: 2, label: "SOL", percent: 2 },
					{ amount: 2, convertedAmount: 2, label: "ADA", percent: 2 },
					{ amount: 2, convertedAmount: 2, label: "MANA", percent: 2 },
					{ amount: 2, convertedAmount: 2, label: "BTC", percent: 2 },
					{ amount: 2, convertedAmount: 2, label: "ETH", percent: 2 },
				]}
				balance={100}
				onClose={onClose}
				exchangeCurrency="USD"
				isOpen={true}
			/>,
		);

		expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
		expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render responsive with other group", () => {
		const onClose = vi.fn();

		const { asFragment } = renderResponsive(
			<PortfolioBreakdownDetails
				assets={[
					{ amount: 60, convertedAmount: 60, label: "ARK", percent: 60 },
					{ amount: 30, convertedAmount: 30, label: "LSK", percent: 30 },

					// grouped
					{ amount: 2, convertedAmount: 2, label: "SOL", percent: 2 },
					{ amount: 2, convertedAmount: 2, label: "ADA", percent: 2 },
					{ amount: 2, convertedAmount: 2, label: "MANA", percent: 2 },
					{ amount: 2, convertedAmount: 2, label: "BTC", percent: 2 },
					{ amount: 2, convertedAmount: 2, label: "ETH", percent: 2 },
				]}
				balance={100}
				onClose={onClose}
				exchangeCurrency="USD"
				isOpen={true}
			/>,
			"xs",
		);

		expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
		expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show tooltip when hovering graph elements", async() => {
		render(
			<PortfolioBreakdownDetails
				assets={[
					{ amount: 85, convertedAmount: 85, label: "ARK", percent: 85 },
					{ amount: 15, convertedAmount: 15, label: "LSK", percent: 15 },
				]}
				balance={100}
				onClose={vi.fn()}
				exchangeCurrency="USD"
				isOpen={true}
			/>,
		);

		expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
		expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(2);

		expect(screen.queryByTestId("PortfolioBreakdownDetails__tooltip")).not.toBeInTheDocument();

		await userEvent.hover(screen.getAllByTestId("DonutGraph__item-hover-area")[0]);

		expect(screen.getByTestId("PortfolioBreakdownDetails__tooltip")).toBeInTheDocument();
		expect(screen.getByTestId("PortfolioBreakdownDetails__tooltip")).toHaveTextContent(/LSK/);
		expect(screen.getByTestId("PortfolioBreakdownDetails__tooltip")).toHaveTextContent(/15%/);

		await userEvent.unhover(screen.getAllByTestId("DonutGraph__item-hover-area")[0]);
		await userEvent.hover(screen.getAllByTestId("DonutGraph__item-hover-area")[1]);

		expect(screen.getByTestId("PortfolioBreakdownDetails__tooltip")).toHaveTextContent(/ARK/);
		expect(screen.getByTestId("PortfolioBreakdownDetails__tooltip")).toHaveTextContent(/85%/);
	});

	it('should show an "m" in balance if amount is more than a million', () => {
		const total = 12_344_000.95;

		render(
			<PortfolioBreakdownDetails
				assets={[
					{ amount: total * 0.85, convertedAmount: total * 0.85, label: "ARK", percent: 85 },
					{ amount: total * 0.15, convertedAmount: total * 0.15, label: "LSK", percent: 15 },
				]}
				balance={total}
				onClose={vi.fn()}
				exchangeCurrency="USD"
				isOpen={true}
			/>,
		);

		expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
		expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(2);
		expect(screen.getByTestId("PortfolioBreakdownDetails__balance")).toHaveTextContent(/12.34m/);
	});

	it("should display decimals using a smaller font size when they are more than 2", () => {
		const total = 50.123_456_78;

		render(
			<PortfolioBreakdownDetails
				assets={[
					{ amount: total * 0.85, convertedAmount: total * 0.85, label: "ARK", percent: 85 },
					{ amount: total * 0.15, convertedAmount: total * 0.15, label: "LSK", percent: 15 },
				]}
				balance={total}
				onClose={vi.fn()}
				exchangeCurrency="BTC"
				isOpen={true}
			/>,
		);

		expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
		expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(2);
		expect(screen.getByTestId("Amount__decimals")).toHaveTextContent(/12345678/);
	});
});
