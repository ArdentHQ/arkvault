import React from "react";

import { SelectCategory } from "./SelectCategory";
import { render } from "@/utils/testing-library";

describe("SelectCategory", () => {
	it("should render", () => {
		const { container, asFragment } = render(<SelectCategory name="category">#All</SelectCategory>);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
