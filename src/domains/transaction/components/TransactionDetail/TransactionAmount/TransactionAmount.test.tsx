import userEvent from "@testing-library/user-event";
import React from "react";

import { TransactionAmount } from "./TransactionAmount";
import { translations } from "@/domains/transaction/i18n";
import { queryElementForSvg, render, renderResponsive, screen } from "@/utils/testing-library";

describe("TransactionAmount", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(<TransactionAmount amount={1} currency="DARK" />, breakpoint);

		expect(container).toHaveTextContent("1 DARK");
		expect(container).toMatchSnapshot();
	});

	it("should render currency amount", () => {
		const { container } = render(<TransactionAmount amount={1} currency="DARK" />);

		expect(container).toHaveTextContent("1 DARK");
		expect(container).toMatchSnapshot();
	});

	it("should render converted currency amount", () => {
		const { container } = render(
			<TransactionAmount amount={1} convertedAmount={1} currency="DARK" exchangeCurrency="ARK" />,
		);

		expect(container).toHaveTextContent("1 DARK");
		expect(container).toHaveTextContent("1 ARK");
	});

	it.each([false, true])("should render label for multiple recipients", (isMultiPayment) => {
		const { container } = render(<TransactionAmount amount={1} currency="DARK" isTotalAmount={isMultiPayment} />);

		expect(container).toHaveTextContent(isMultiPayment ? translations.TOTAL_AMOUNT : translations.AMOUNT);
		expect(container).toMatchSnapshot();
	});

	it.each(["Sent", "Received"])("should render '%s' icon", (type) => {
		const { container } = render(<TransactionAmount amount={1} currency="DARK" isSent={type === "Sent"} />);

		expect(queryElementForSvg(container, type.toLowerCase())).toBeInTheDocument();
	});

	it.each(["Sent", "Received"])("should render info indicator for '%s'", async (type) => {
		render(
			<TransactionAmount amount={2} returnedAmount={1} isTotalAmount currency="DARK" isSent={type === "Sent"} />,
		);

		expect(screen.getByTestId("AmountLabel__hint")).toBeInTheDocument();

		expect(queryElementForSvg(document, "hint-small")).toBeInTheDocument();

		await userEvent.hover(screen.getByTestId("AmountLabel__hint"));

		expect(screen.getByText("Including 1 DARK sent to itself")).toBeInTheDocument();
	});
});
