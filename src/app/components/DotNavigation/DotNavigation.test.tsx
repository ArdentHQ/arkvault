import userEvent from "@testing-library/user-event";
import React from "react";

import { DotNavigation } from "./DotNavigation";
import { render, screen } from "@/utils/testing-library";

describe("DotNavigation", () => {
	it("should render", () => {
		const { container, asFragment } = render(<DotNavigation />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("handles click on a dot", () => {
		const clickMock = jest.fn();
		render(<DotNavigation onClick={clickMock} />);

		userEvent.click(screen.getByTestId("DotNavigation-Step-1"));

		expect(clickMock).toHaveBeenCalledWith(1);
	});
});
