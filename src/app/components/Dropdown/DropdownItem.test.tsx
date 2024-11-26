import React from "react";

import { render, screen } from "@/utils/testing-library";
import { DropdownItem } from "./DropdownItem";

describe("DropdownItem", () => {
	it("should render", () => {
		render(<DropdownItem isActive={true} />);
		expect(screen.getByRole("listitem")).toBeInTheDocument;
	});
	it("should render with active styles", () => {
		render(<DropdownItem isActive={true} />);
		expect(screen.getByRole("listitem")).toHaveClass(
			"bg-theme-primary-50 text-theme-primary-600 dark:bg-black border-theme-primary-600",
		);
	});

	it("should render with inactive styles", () => {
		render(<DropdownItem isActive={false} />);
		expect(screen.getByRole("listitem")).toHaveClass(
			"cursor-pointer text-theme-secondary-700 hover:text-theme-secondary-900 hover:bg-theme-secondary-200 hover:dark:bg-theme-secondary-900 hover:dark:text-theme-secondary-200 dark:text-theme-secondary-200 border-transparent",
		);
	});
});
