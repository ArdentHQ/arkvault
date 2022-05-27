import React from "react";

import { EmptyBlock } from "./EmptyBlock";
import { render, screen } from "@/utils/testing-library";

describe("EmptyBlock", () => {
	it("should render", () => {
		const { asFragment, container } = render(<EmptyBlock />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with children", () => {
		render(<EmptyBlock>I am a children</EmptyBlock>);

		expect(screen.getByText("I am a children")).toBeInTheDocument();
	});

	it("should render with size", () => {
		const { container } = render(<EmptyBlock size="sm">I am a children</EmptyBlock>);

		expect(container).toMatchSnapshot();
	});
});
