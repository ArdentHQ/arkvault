import React from "react";
import userEvent from "@testing-library/user-event";
import { Item, SideBar } from "./SideBar";
import { render, screen, renderResponsiveWithRoute, waitFor } from "@/utils/testing-library";

describe("SideBar", () => {
	const items: Item[] = [
		{
			icon: "Sliders",
			itemKey: "general",
			label: "General",
			route: "general",
		},
		{
			icon: "Lock",
			itemKey: "password",
			label: "Password",
			route: "password",
		},
		{
			icon: "ArrowUpTurnBracket",
			itemKey: "export",
			label: "Export",
			route: "export",
		},
	];

	it("should render", () => {
		const { asFragment } = render(
			<SideBar handleActiveItem={vi.fn()} activeItem={items[0].itemKey} items={items} />,
		);

		expect(screen.getByTestId("side-menu__item--general")).toBeInTheDocument();
		expect(screen.getByTestId("side-menu__item--general")).toBeInTheDocument();
		expect(screen.getByTestId("side-menu__item--password")).toBeInTheDocument();
		expect(screen.getByTestId("side-menu__item--export")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["sm", "md", "lg"])("should render responsive dropdown", async (breakpoint) => {
		const handleActiveItemMock = vi.fn();

		const { asFragment } = renderResponsiveWithRoute(
			<SideBar handleActiveItem={handleActiveItemMock} activeItem={items[0].itemKey} items={items} />,
			breakpoint,
		);

		const dropdown = screen.getByTestId("dropdown__toggle");

		expect(dropdown).toBeInTheDocument();

		expect(dropdown).toHaveTextContent("General");

		await userEvent.click(dropdown);

		const passwordItem = screen.getByTestId("dropdown__option--1");

		expect(passwordItem).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		expect(handleActiveItemMock).toHaveBeenCalledTimes(0);

		await userEvent.click(passwordItem);

		await waitFor(() => expect(handleActiveItemMock).toHaveBeenCalledTimes(1));
	});
});
