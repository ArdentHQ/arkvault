import React from "react";

import { Checkbox } from "./Checkbox";
import { Color } from "@/types";
import { render } from "@/utils/testing-library";

describe("Checkbox", () => {
	let consoleSpy: vi.SpyInstance;

	beforeAll(() => {
		consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterAll(() => {
		consoleSpy.mockRestore();
	});

	it("should render", () => {
		const { container } = render(<Checkbox />);

		expect(container).toMatchSnapshot();
	});

	it.each(["info", "success", "warning", "danger", "hint"])("should render a %s color", (color) => {
		const { container } = render(<Checkbox color={color as Color} />);

		expect(container).toMatchSnapshot();
	});
});
