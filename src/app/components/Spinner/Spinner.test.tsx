import React from "react";

import { Spinner } from "./Spinner";
import { render } from "@/utils/testing-library";

describe("Spinner", () => {
	let consoleSpy: jest.SpyInstance;

	beforeAll(() => {
		consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterAll(() => {
		consoleSpy.mockRestore();
	});

	it("should render", () => {
		const { container } = render(<Spinner />);

		expect(container).toMatchSnapshot();
	});

	it.each(["info", "success", "warning", "danger", "hint"])("should render a %s color", (color) => {
		const { container } = render(<Spinner color={color} />);

		expect(container).toMatchSnapshot();
	});

	it("should render a small one", () => {
		const { container } = render(<Spinner size="sm" />);

		expect(container).toMatchSnapshot();
	});

	it("should render a large one", () => {
		const { container } = render(<Spinner size="lg" />);

		expect(container).toMatchSnapshot();
	});
});
