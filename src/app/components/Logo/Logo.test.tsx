import React from "react";

import { Logo } from "./Logo";
import { render } from "@/utils/testing-library";

describe("Logo", () => {
	it("should render", () => {
		const { container } = render(<Logo />);

		expect(container).toMatchSnapshot();
	});

	it("should render with height", () => {
		const { container } = render(<Logo height={20} />);

		expect(container).toMatchSnapshot();
	});
});
