import React from "react";

import { FTXAd } from "./FTXAd";
import { render } from "@/utils/testing-library";

describe("FTXAd", () => {
	it("should render", () => {
		const { container, asFragment } = render(<FTXAd />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
