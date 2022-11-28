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
		const handleClick = vi.fn();
		const { container, asFragment } = render(<Card onClick={() => handleClick()}>Test</Card>);

		expect(container).toBeInTheDocument();

		userEvent.click(screen.getByText("Test"));

		expect(handleClick).toHaveBeenCalledWith();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom options", async () => {
		const handleClick = vi.fn();
		const { container, asFragment } = render(
			<Card actions={[{ value: "1", label: "Action 1" }]} onClick={() => handleClick()}>
				Test
			</Card>,
		);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("dropdown__toggle")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__toggle"));
		await expect(screen.findByTestId("dropdown__option--0")).resolves.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});
});
