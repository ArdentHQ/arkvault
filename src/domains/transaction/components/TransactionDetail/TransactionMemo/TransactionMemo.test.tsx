import React from "react";

import { translations } from "@/domains/transaction/i18n";
import { render } from "@/utils/testing-library";

import { TransactionMemo } from "./TransactionMemo";

describe("TransactionMemo", () => {
	it("should render", () => {
		const memo = "test memo";

		const { container } = render(<TransactionMemo memo={memo} />);

		expect(container).toHaveTextContent(translations.MEMO);
		expect(container).toHaveTextContent(memo);

		expect(container).toMatchSnapshot();
	});
});
