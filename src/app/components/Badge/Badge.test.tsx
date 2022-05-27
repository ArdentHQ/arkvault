import React from "react";

import { Badge } from "./Badge";
import { Position, Size } from "@/types";
import { render } from "@/utils/testing-library";

describe("Badge", () => {
	it("should render", () => {
		const { container } = render(<Badge />);

		expect(container).toMatchSnapshot();
	});

	it("should render with icon", () => {
		const { container } = render(<Badge icon="settings" />);

		expect(container).toMatchSnapshot();
	});

	it.each(["top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left"])(
		"should render with position '%s'",
		(position) => {
			const { container } = render(<Badge icon="settings" position={position as Position} />);

			expect(container).toMatchSnapshot();
		},
	);

	it.each(["md", "lg"])("should render with size '%s'", (size) => {
		const { container } = render(<Badge icon="settings" size={size as Size} />);

		expect(container).toMatchSnapshot();
	});
});
