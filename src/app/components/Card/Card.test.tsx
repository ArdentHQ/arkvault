import userEvent from "@testing-library/user-event";
import React from "react";

import { Card } from "./Card";
import { render, screen } from "@/utils/testing-library";

describe("Card", () => {
	it("should render", () => {
		const { container, asFragment } = render(<Card />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle click", () => {
		const handleClick = jest.fn();
		const { container, asFragment } = render(<Card onClick={() => handleClick()}>Test</Card>);

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText("Test"));

		expect(handleClick).toHaveBeenCalledWith();
		expect(asFragment()).toMatchSnapshot();
	});
});
