import React from "react";

import { TransactionType } from "./TransactionType";
import { translations } from "@/domains/transaction/i18n";
import { renderResponsive } from "@/utils/testing-library";

describe("TransactionType", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(<TransactionType type="multiPayment" />, breakpoint);

		expect(container).toHaveTextContent("multipayment.svg");
		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.MULTI_PAYMENT);

		expect(container).toMatchSnapshot();
	});
});
