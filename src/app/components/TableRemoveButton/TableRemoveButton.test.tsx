import userEvent from "@testing-library/user-event";
import React from "react";

import { TableRemoveButton } from "./TableRemoveButton";
import { render, screen } from "@/utils/testing-library";

describe("TableRemoveButton", () => {
	it("should render", () => {
		const { container } = render(<TableRemoveButton onClick={jest.fn()} />);

		expect(screen.getByTestId("TableRemoveButton")).toHaveTextContent("trash.svg");

		expect(container).toMatchSnapshot();
	});

	it("should render compact", () => {
		const { container } = render(<TableRemoveButton onClick={jest.fn()} isCompact />);

		expect(screen.getByTestId("TableRemoveButton--compact")).toHaveTextContent("trash.svg");

		expect(container).toMatchSnapshot();
	});

	it("should execute onClick callback", () => {
		const onClick = jest.fn();

		render(<TableRemoveButton onClick={onClick} />);

		userEvent.click(screen.getByTestId("TableRemoveButton"));

		expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});
});
