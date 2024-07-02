import React from "react";

import { render } from "@/utils/testing-library";

import { Logo } from "./Logo";

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
