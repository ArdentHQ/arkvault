import React from "react";

import { render } from "@/utils/testing-library";

import { Dot } from "./Dot";

describe("Dot", () => {
	it("should render", () => {
		const { container, asFragment } = render(<Dot />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
