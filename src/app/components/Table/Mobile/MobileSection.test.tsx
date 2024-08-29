import React from "react";
import { render, screen } from "@/utils/testing-library";
import { MobileSection } from "./MobileSection";
describe("MobileSection", () => {
	it("should render", () => {
		render(
			<MobileSection title="Test Title" data-testid="MobileSection__wrapper">
				Content
			</MobileSection>,
		);

		expect(screen.getByTestId("MobileSection__wrapper")).toBeInTheDocument();
	});

	it("should render title", () => {
		render(
			<MobileSection title="Test Title" data-testid="MobileSection__wrapper">
				Content
			</MobileSection>,
		);

		expect(screen.getByText("Test Title")).toBeInTheDocument();
	});

	it("should render children", () => {
		render(
			<MobileSection title="Test Title" data-testid="MobileSection__wrapper">
				Content
			</MobileSection>,
		);

		expect(screen.getByText("Content")).toBeInTheDocument();
	});

	it("should render with custom class", () => {
		render(
			<MobileSection title="Test Title" className="custom-class" data-testid="MobileSection__wrapper">
				Content
			</MobileSection>,
		);

		expect(screen.getByTestId("MobileSection__wrapper")).toHaveClass("custom-class");
	});
});
