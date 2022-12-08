import React from "react";

import { Dot } from "./Dot";
import { render } from "@/utils/testing-library";

describe("Dot", () => {
	it("should render", () => {
		const { container, asFragment } = render(<Dot />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
