import React from "react";
import { render, screen } from "@/utils/testing-library";
import { TableWrapper } from "./TableWrapper";

describe("TableWrapper", () => {
	it("should render", () => {
		render(<TableWrapper>Test content</TableWrapper>);

		expect(screen.getByTestId("TableWrapper")).toBeTruthy();
	});

	it("should render with additional classes", () => {
		render(<TableWrapper className="custom-class">Test content</TableWrapper>);

		expect(screen.getByTestId("TableWrapper")).toHaveClass("custom-class");
	});

	it("should render children", () => {
		render(<TableWrapper>Test content</TableWrapper>);

		expect(screen.getByText("Test content")).toBeTruthy();
	});
});
