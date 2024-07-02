import React from "react";
import userEvent from "@testing-library/user-event";
import { IOsInstructions } from "./IOsInstructions";
import { render, screen } from "@/utils/testing-library";

describe("IOsInstructions", () => {
	it("should render ios instructions", () => {
		const { container } = render(<IOsInstructions onClose={vi.fn()} />);

		expect(container).toMatchSnapshot();
	});

	it("should handle close", async () => {
		const onClose = vi.fn();
		render(<IOsInstructions onClose={onClose} />);

		await userEvent.click(screen.getByTestId("IOsInstructions__close-button"));

		expect(onClose).toHaveBeenCalledWith(expect.anything());
	});
});
