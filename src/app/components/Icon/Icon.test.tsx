import React from "react";

import { Icon } from "./Icon";
import { render, screen } from "@/utils/testing-library";

describe("Icon", () => {
	it("should render", () => {
		const { container, asFragment } = render(<Icon name="ARK" />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render fallback", () => {
		const { asFragment } = render(<Icon name="unknown" fallback={<span>Not found</span>} />);

		expect(screen.getByText("Not found")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom dimensions", () => {
		const { asFragment } = render(<Icon dimensions={[20, 20]} name="ARK" />);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["sm", "md", "lg", "xl"])("should render with size '%s'", (size) => {
		const { asFragment } = render(<Icon name="ARK" size={size} />);

		expect(asFragment).toMatchSnapshot();
	});
});
