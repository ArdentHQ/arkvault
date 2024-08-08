import userEvent from "@testing-library/user-event";
import React from "react";

import { Toggle } from "./Toggle";
import { render, screen } from "@/utils/testing-library";

describe("Toggle", () => {
	it("should render", () => {
		const { container, asFragment } = render(<Toggle />);

		expect(container).toBeInTheDocument();
		expect(screen.getByRole("checkbox")).not.toHaveAttribute("checked", "");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render disabled", () => {
		const { container, asFragment } = render(<Toggle disabled />);

		expect(container).toBeInTheDocument();
		expect(screen.getByRole("checkbox")).toBeDisabled();
		expect(screen.getByRole("checkbox")).not.toHaveAttribute("checked", "");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render small", () => {
		const { container, asFragment } = render(<Toggle small />);

		expect(container).toBeInTheDocument();
		expect(screen.getByRole("checkbox")).not.toHaveAttribute("checked", "");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render always on", () => {
		const { container, asFragment } = render(<Toggle alwaysOn />);

		expect(container).toBeInTheDocument();
		expect(screen.getByRole("checkbox")).not.toHaveAttribute("checked", "");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should toggle checked", async () => {
		const { asFragment } = render(<Toggle />);
		const toggle = screen.getByRole("checkbox");

		await userEvent.click(toggle);

		expect(toggle.checked).toBe(true);
		expect(asFragment()).toMatchSnapshot();
	});
});
