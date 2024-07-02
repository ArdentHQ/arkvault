import React from "react";

import { translations } from "@/domains/transaction/i18n";
import { queryElementForSvg, renderResponsive } from "@/utils/testing-library";

import { TransactionType } from "./TransactionType";

describe("TransactionType", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(<TransactionType type="multiPayment" />, breakpoint);

		expect(queryElementForSvg(container, "multipayment")).toBeInTheDocument();

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.MULTI_PAYMENT);

		expect(container).toMatchSnapshot();
	});
});
