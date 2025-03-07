import React from "react";
import { render, screen } from "@testing-library/react";
import { MobileTableElement, MobileTableElementRow } from "./MobileTableElement";

describe("MobileTableElement", () => {
	it("should render with title and children", () => {
		render(
			<MobileTableElement title="Test Title">
				<div>Child 1</div>
				<div>Child 2</div>
			</MobileTableElement>,
		);
		expect(screen.getByText("Test Title")).toBeInTheDocument();
		expect(screen.getByText("Child 1")).toBeInTheDocument();
		expect(screen.getByText("Child 2")).toBeInTheDocument();
	});

	it.each([
		["danger", "border-theme-danger-400", "bg-theme-danger-100"],
		["primary", "border-theme-primary-300", "bg-theme-primary-100"],
		["success", "border-theme-success-300", "bg-theme-success-100"],
		["warning", "border-theme-warning-400", "bg-theme-warning-100"],
	])("should apply correct classes for %s variant", (variant, borderClass, bgClass) => {
		render(
			<MobileTableElement title="Test" variant={variant}>
				<div>Child</div>
			</MobileTableElement>,
		);
		const mainDiv = screen.getByTestId("mobile-table-element");
		expect(mainDiv).toHaveClass(borderClass);
		const headerDiv = screen.getByTestId("mobile-table-element-header");
		expect(headerDiv).toHaveClass(bgClass);
	});

	it("should apply default classes when no variant is provided", () => {
		render(
			<MobileTableElement title="Test">
				<div>Child</div>
			</MobileTableElement>,
		);
		const mainDiv = screen.getByTestId("mobile-table-element");
		expect(mainDiv).toHaveClass("border-theme-secondary-300");
		const headerDiv = screen.getByTestId("mobile-table-element-header");
		expect(headerDiv).toHaveClass("bg-theme-secondary-100");
	});

	it("should render titleExtra", () => {
		render(
			<MobileTableElement title="Test" titleExtra={<span>Extra</span>}>
				<div>Child</div>
			</MobileTableElement>,
		);
		expect(screen.getByText("Extra")).toBeInTheDocument();
	});

	it("should apply bodyClassName to the body div", () => {
		render(
			<MobileTableElement title="Test" bodyClassName="custom-body-class">
				<div>Child</div>
			</MobileTableElement>,
		);
		const bodyDiv = screen.getByTestId("mobile-table-element-body");
		expect(bodyDiv).toHaveClass("custom-body-class");
	});

	it("should render title as React node", () => {
		render(
			<MobileTableElement title={<span data-testid="title-node">Test Title</span>}>
				<div>Child</div>
			</MobileTableElement>,
		);
		expect(screen.getByTestId("title-node")).toBeInTheDocument();
	});

	it("should pass other props to the main div", () => {
		render(
			<MobileTableElement title="Test" data-testid="main-div">
				<div>Child</div>
			</MobileTableElement>,
		);
		expect(screen.getByTestId("main-div")).toHaveAttribute("data-testid", "main-div");
	});
});

describe("MobileTableElementRow", () => {
	it("should render with title and children", () => {
		render(
			<MobileTableElementRow title="Row Title">
				<div>Row Child</div>
			</MobileTableElementRow>,
		);
		expect(screen.getByText("Row Title")).toBeInTheDocument();
		expect(screen.getByText("Row Child")).toBeInTheDocument();
	});
});
