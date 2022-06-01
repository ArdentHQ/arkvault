import React from "react";

import { RadioButton } from "./RadioButton";
import { render } from "@/utils/testing-library";

describe("RadioButton", () => {
	it("should render", () => {
		const { container } = render(<RadioButton />);

		expect(container).toMatchSnapshot();
	});

	it.each(["info", "success", "warning", "danger", "hint"])("should render a %s color", (color) => {
		const { container } = render(<RadioButton color={color} />);

		expect(container).toMatchSnapshot();
	});
});
