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

	it("handles click on a dot", async () => {
		const clickMock = vi.fn();
		render(<DotNavigation onClick={clickMock} />);

		await userEvent.click(screen.getByTestId("DotNavigation-Step-1"));

		expect(clickMock).toHaveBeenCalledWith(1);
	});
});
