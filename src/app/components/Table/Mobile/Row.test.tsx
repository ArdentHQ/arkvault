import React from "react";

import { RowWrapper, RowLabel, ResponsiveAddressWrapper } from "./Row";
import { render } from "@/utils/testing-library";

describe("Row", () => {
	it("should render", () => {
		const { container } = render(
			<RowWrapper>
				<RowLabel>Hello World</RowLabel>
			</RowWrapper>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render responsive wrapper", () => {
		const { container } = render(
			<RowWrapper>
				<RowLabel>Hello World</RowLabel>

				<ResponsiveAddressWrapper>The address</ResponsiveAddressWrapper>
			</RowWrapper>,
		);

		expect(container).toMatchSnapshot();
	});
});
