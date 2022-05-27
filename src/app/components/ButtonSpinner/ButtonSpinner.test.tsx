import React from "react";

import { ButtonSpinner } from "./ButtonSpinner";
import { render } from "@/utils/testing-library";

describe("ButtonSpinner", () => {
	let consoleSpy: jest.SpyInstance;

	beforeAll(() => {
		consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterAll(() => {
		consoleSpy.mockRestore();
	});

	it("should render", () => {
		const { container } = render(<ButtonSpinner />);

		expect(container).toMatchSnapshot();
	});

	it.each(["primary", "secondary", "danger", "transparent", "info", "reverse"])(
		"should render a %s variant",
		(variant) => {
			const { container } = render(<ButtonSpinner color={variant} />);

			expect(container).toMatchSnapshot();
		},
	);
});
