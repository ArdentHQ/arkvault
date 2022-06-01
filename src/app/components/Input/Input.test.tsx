import React from "react";

import { Input } from "./Input";
import { render, screen } from "@/utils/testing-library";

describe("Input", () => {
	it.each([true, false])("should render when isCompact = %s", (isCompact: boolean) => {
		const { asFragment } = render(<Input isCompact={isCompact} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as custom element", () => {
		const { asFragment } = render(<Input as="select" />);
		const input = screen.getByTestId("Input");

		expect(input.tagName).toBe("SELECT");

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with focus", () => {
		const { asFragment } = render(<Input isFocused />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with invalid", () => {
		const { asFragment } = render(<Input isInvalid={true} errorMessage="Field invalid" />);
		const input = screen.getByTestId("Input__error");

		expect(input).toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with addons", () => {
		const { asFragment } = render(
			<Input
				addons={{
					end: {
						content: <span>end</span>,
						wrapperClassName: "some-class-name",
					},
					start: {
						content: <span>start</span>,
					},
				}}
			/>,
		);

		const addonWrapper = screen.getByTestId("Input__addon-end");

		expect(addonWrapper).toBeInTheDocument();
		expect(addonWrapper).toHaveClass("some-class-name");
		expect(addonWrapper).toHaveTextContent("end");

		expect(screen.getByText("start")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with suggestion", () => {
		const { asFragment } = render(<Input suggestion="suggestion" />);

		expect(screen.getByTestId("Input__suggestion")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
