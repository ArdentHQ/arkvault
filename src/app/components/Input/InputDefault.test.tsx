import React from "react";

import { InputDefault } from "./InputDefault";
import { render, screen } from "@/utils/testing-library";

describe("InputDefault", () => {
	it("should render a default input", () => {
		const { asFragment } = render(<InputDefault />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with a custom element", () => {
		render(<InputDefault as="select" />);
		const input = screen.getByTestId("Input");

		expect(input.tagName).toBe("SELECT");
	});
});
