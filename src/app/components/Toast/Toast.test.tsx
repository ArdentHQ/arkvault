import React from "react";
import { Toast } from "./Toast";
import { Color } from "@/types";

import { render, screen } from "@/utils/testing-library";

describe("Toast", () => {
	it("should render", () => {
		const { container, asFragment } = render(
			<Toast>
				<span>Hello World!</span>
			</Toast>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["info", "success", "warning", "danger", "hint"])("should render as %s toast", (variant) => {
		const { container, asFragment } = render(
			<Toast variant={variant as Color}>
				<span>Hello World!</span>
			</Toast>,
		);

		expect(container).toBeInTheDocument();

		expect(screen.getByText("Hello World!")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
