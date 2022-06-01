import React from "react";

import { Tooltip } from "./Tooltip";
import { render } from "@/utils/testing-library";

describe("Tooltip", () => {
	it("should render", () => {
		const { asFragment } = render(<Tooltip content="tooltip" />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with theme", () => {
		const { asFragment } = render(<Tooltip content="tooltip" theme="dark" />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render small", () => {
		const { asFragment } = render(<Tooltip content="small tooltip" size="sm" />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with extend class", () => {
		const { asFragment } = render(<Tooltip content="small tooltip" className="bg-theme-success-200" />);

		expect(asFragment()).toMatchSnapshot();
	});
});
