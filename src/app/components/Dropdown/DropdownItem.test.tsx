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
		expect(screen.getByRole("listitem")).toHaveClass("bg-theme-primary-50");
	});

	it("should render with inactive styles", () => {
		render(<DropdownItem isActive={false} />);
		expect(screen.getByRole("listitem")).toHaveClass("border-transparent");
	});
});
