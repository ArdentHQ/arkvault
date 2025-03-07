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
		const { container } = render(
			<MobileTableElement title="Test" variant={variant}>
				<div>Child</div>
			</MobileTableElement>,
		);
		const mainDiv = container.firstChild;
		expect(mainDiv).toHaveClass(borderClass);
		const headerDiv = mainDiv.firstChild;
		expect(headerDiv).toHaveClass(bgClass);
	});

	it("should apply default classes when no variant is provided", () => {
		const { container } = render(
			<MobileTableElement title="Test">
				<div>Child</div>
			</MobileTableElement>,
		);
		const mainDiv = container.firstChild;
		expect(mainDiv).toHaveClass("border-theme-secondary-300");
		const headerDiv = mainDiv.firstChild;
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
		const { container } = render(
			<MobileTableElement title="Test" bodyClassName="custom-body-class">
				<div>Child</div>
			</MobileTableElement>,
		);
		const bodyDiv = container.firstChild.childNodes[1];
		expect(bodyDiv).toHaveClass("custom-body-class");
		expect(bodyDiv).toHaveClass("grid");
		expect(bodyDiv).toHaveClass("gap-4");
		expect(bodyDiv).toHaveClass("px-4");
		expect(bodyDiv).toHaveClass("py-3");
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
		const { container } = render(
			<MobileTableElement title="Test" data-testid="main-div">
				<div>Child</div>
			</MobileTableElement>,
		);
		expect(container.firstChild).toHaveAttribute("data-testid", "main-div");
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

	it("should apply default classes", () => {
		const { container } = render(
			<MobileTableElementRow title="Row Title">
				<div>Row Child</div>
			</MobileTableElementRow>,
		);
		const rowDiv = container.firstChild;
		expect(rowDiv).toHaveClass("grid");
		expect(rowDiv).toHaveClass("grid-cols-1");
		expect(rowDiv).toHaveClass("gap-2");
	});

	it("should apply custom className", () => {
		const { container } = render(
			<MobileTableElementRow title="Row Title" className="custom-row-class">
				<div>Row Child</div>
			</MobileTableElementRow>,
		);
		const rowDiv = container.firstChild;
		expect(rowDiv).toHaveClass("custom-row-class");
		expect(rowDiv).toHaveClass("grid");
		expect(rowDiv).toHaveClass("grid-cols-1");
		expect(rowDiv).toHaveClass("gap-2");
	});

	it("should render title with correct classes", () => {
		render(
			<MobileTableElementRow title="Row Title">
				<div>Row Child</div>
			</MobileTableElementRow>,
		);
		const titleDiv = screen.getByText("Row Title");
		expect(titleDiv).toHaveClass("text-sm");
		expect(titleDiv).toHaveClass("font-semibold");
		expect(titleDiv).toHaveClass("text-theme-secondary-700");
		expect(titleDiv).toHaveClass("dark:text-theme-dark-200");
	});
});
