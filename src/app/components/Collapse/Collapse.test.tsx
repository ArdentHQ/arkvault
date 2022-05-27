import React from "react";

import { Collapse } from "./Collapse";
import { render, screen } from "@/utils/testing-library";

describe("Collapse", () => {
	it("should render", () => {
		const { asFragment } = render(<Collapse>Test</Collapse>);

		expect(screen.getByTestId("Collapse")).toHaveAttribute("aria-hidden", "true");
		expect(screen.getByTestId("Collapse")).toHaveTextContent("Test");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render visible", () => {
		const { asFragment } = render(<Collapse isOpen>Test</Collapse>);

		expect(screen.getByTestId("Collapse")).toHaveAttribute("aria-hidden", "false");
		expect(screen.getByTestId("Collapse")).toHaveTextContent("Test");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom scroll", () => {
		const { asFragment } = render(<Collapse className="custom-scroll">Test</Collapse>);

		expect(screen.getByTestId("Collapse")).toHaveAttribute("aria-hidden", "true");
		expect(screen.getByTestId("Collapse")).toHaveTextContent("Test");
		expect(asFragment()).toMatchSnapshot();
	});
});
