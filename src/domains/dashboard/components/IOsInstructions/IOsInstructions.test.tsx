import React from "react";
import userEvent from "@testing-library/user-event";
import { IOsInstructions } from "./IOsInstructions";
import { render, screen } from "@/utils/testing-library";

describe("IOsInstructions", () => {
	it("should render ios instructions", () => {
		const { container } = render(<IOsInstructions onClose={jest.fn()} />);

		expect(container).toMatchSnapshot();
	});

	it("should handle close", () => {
		const onClose = jest.fn();
		render(<IOsInstructions onClose={onClose} />);

		userEvent.click(screen.getByTestId("IOsInstructions__close-button"));

		expect(onClose).toHaveBeenCalledWith(expect.anything());
	});
});
