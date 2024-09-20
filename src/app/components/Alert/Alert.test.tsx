import React from "react";
import { Alert } from "./Alert";
import { Color } from "@/types";

import { render, screen } from "@/utils/testing-library";

describe("Alert", () => {
	it("should render", () => {
		const { container, asFragment } = render(
			<Alert>
				<span>Hello World!</span>
			</Alert>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as collapsible", () => {
		const { container, asFragment } = render(
			<Alert collapsible>
				<span>Hello World!</span>
			</Alert>,
		);

		expect(container).toBeInTheDocument();

		expect(screen.getByTestId("Alert__chevron")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["info", "success", "warning", "danger", "hint", "warning-dark"])(
		"should render as %s alert",
		(variant) => {
			const { container, asFragment } = render(
				<Alert variant={variant as Color}>
					<span>Hello World!</span>
				</Alert>,
			);

			expect(container).toBeInTheDocument();

			expect(screen.getByText("Hello World!")).toBeInTheDocument();
			expect(asFragment()).toMatchSnapshot();
		},
	);
});
