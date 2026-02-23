import React from "react";

import { TransactionFee } from "./TransactionFee";
import { render } from "@/utils/testing-library";
import { BigNumber } from "@/app/lib/helpers";

describe("TransactionFee", () => {
	it("should render", () => {
		const { container } = render(
			<TransactionFee currency="DARK" value={BigNumber.make(1)} convertedValue={1.5} exchangeCurrency="EUR" />,
		);

		expect(container).toHaveTextContent("1 DARK");
	});
});
