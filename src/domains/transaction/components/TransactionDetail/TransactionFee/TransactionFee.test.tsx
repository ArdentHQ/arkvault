import React from "react";

import { render } from "@/utils/testing-library";

import { TransactionFee } from "./TransactionFee";

describe("TransactionFee", () => {
	it("should render", () => {
		const { container } = render(
			<TransactionFee currency="DARK" value={1} convertedValue={1.5} exchangeCurrency="EUR" />,
		);

		expect(container).toHaveTextContent("1 DARK");
		expect(container).toMatchSnapshot();
	});
});
