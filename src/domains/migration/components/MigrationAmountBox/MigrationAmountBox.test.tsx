import React from "react";

import { MigrationAmountBox } from "./MigrationAmountBox";
import { render, screen } from "@/utils/testing-library";

describe("MigrationAmountBox", () => {
	it.each([
		[0.1, 0.01],
		["0.1", "0.01"],
		[Number(0.1), Number(0.01)],
		[Number("0.1"), Number("0.01")],
	])("should render and subtract amount of %s fee of %s", (a: any, b: any) => {
		const { asFragment } = render(<MigrationAmountBox amount={a} fee={b} ticker="ARK" />);

		const [amount, fee, total] = screen.getAllByTestId("Amount");

		expect(amount).toHaveTextContent("0.1 ARK");
		expect(fee).toHaveTextContent("0.01 ARK");
		expect(total).toHaveTextContent("0.09 ARK");
		expect(asFragment()).toMatchSnapshot();
	});
});
