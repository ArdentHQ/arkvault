import userEvent from "@testing-library/user-event";
import React from "react";

import { SideBarItem } from "./SideBarItem";
import { render, screen } from "@/utils/testing-library";

const item = {
	icon: "Plugin",
	isActive: false,
	itemKey: "plugin",
	label: "General",
	route: "/settings/general",
};

describe("SideBarItem", () => {
	it("should render", () => {
		const { container, asFragment } = render(<SideBarItem {...item} />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as active", () => {
		const { container, asFragment } = render(<SideBarItem {...item} isActive={true} />);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should fire click event", () => {
		const handleActiveItem = jest.fn();

		render(<SideBarItem {...item} handleActiveItem={handleActiveItem} />);
		const menuItem = screen.getByTestId("side-menu__item--plugin");

		userEvent.click(menuItem);

		expect(handleActiveItem).toHaveBeenCalledWith("plugin");
	});
});
