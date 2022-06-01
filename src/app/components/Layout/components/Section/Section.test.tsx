import React from "react";

import { Section } from "./Section";
import { render } from "@/utils/testing-library";

describe("Section", () => {
	it("should render", () => {
		const { container, asFragment } = render(<Section />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom background class name", () => {
		const { container, asFragment } = render(<Section backgroundClassName="bg-theme-secondary-background" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with border", () => {
		const { container, asFragment } = render(<Section border />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
