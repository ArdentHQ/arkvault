import React from "react";

import { TotalAmountBox } from "./TotalAmountBox";
import { render, screen } from "@/utils/testing-library";

describe("TotalAmountBox", () => {
	it.each([
		[0.1, 0.01],
		["0.1", "0.01"],
		[Number(0.1), Number(0.01)],
		[Number("0.1"), Number("0.01")],
	])("should render with amount of %s and fee of %s", (a: any, b: any) => {
		const { asFragment } = render(<TotalAmountBox amount={a} fee={b} ticker="ARK" />);

		const [amount, fee, total] = screen.getAllByTestId("Amount");

		expect(amount).toHaveTextContent("0.1 ARK");
		expect(fee).toHaveTextContent("0.01 ARK");
		expect(total).toHaveTextContent("0.11 ARK");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with converted values if convertValues is true", () => {
		render(
			<TotalAmountBox
				amount={0.1}
				fee={0.01}
				ticker="ARK"
				convertValues
				exchangeTicker="ARK"
				convertedAmount={0.01}
				convertedFee={0.001}
			/>,
		);

		expect(screen.getAllByTestId("Amount")).toHaveLength(6);
	});

	it("should not render converted values if convertValues is false", () => {
		render(<TotalAmountBox amount={0.1} fee={0.01} ticker="ARK" convertValues={false} />);

		expect(screen.getAllByTestId("Amount")).toHaveLength(3);
	});
});
