import userEvent from "@testing-library/user-event";
import React from "react";

import { TableRemoveButton } from "./TableRemoveButton";
import { render, screen } from "@/utils/testing-library";

describe("TableRemoveButton", () => {
	it("should render", () => {
		const { container } = render(<TableRemoveButton onClick={vi.fn()} />);

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getByTestId("TableRemoveButton").querySelector("svg#trash")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should render compact", () => {
		const { container } = render(<TableRemoveButton onClick={vi.fn()} isCompact />);

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getByTestId("TableRemoveButton--compact").querySelector("svg#trash")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should execute onClick callback", () => {
		const onClick = vi.fn();

		render(<TableRemoveButton onClick={onClick} />);

		userEvent.click(screen.getByTestId("TableRemoveButton"));

		expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should not execute onClick callback if disabled", () => {
		const onClick = vi.fn();

		render(<TableRemoveButton onClick={onClick} isDisabled />);

		userEvent.click(screen.getByTestId("TableRemoveButton"));

		expect(onClick).not.toHaveBeenCalled();
	});
});
