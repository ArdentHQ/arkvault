import React from "react";

import { CircularProgressBar } from "./CircularProgressBar";
import { render, screen } from "@/utils/testing-library";

describe("CircularProgressBar", () => {
	it("should render", () => {
		const { container, asFragment } = render(<CircularProgressBar value={50} />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByTestId("CircularProgressBar__percentage")).toHaveTextContent("50%");
	});

	it("should render without text content", () => {
		const { container, asFragment } = render(<CircularProgressBar showValue={false} />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});
});
