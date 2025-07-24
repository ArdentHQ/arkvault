import React from "react";

import { Logo, LogoAlpha } from "./Logo";
import { render, renderResponsive } from "@/utils/testing-library";

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

describe("LogoAlpha", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", async (breakpoint) => {
		const { container } = renderResponsive(<LogoAlpha />, breakpoint);

		expect(container).toMatchSnapshot();
	});
});
