import React from "react";
import { SectionBodyItem, SectionHeaderMobile } from "./LedgerImportStep.blocks";
import { render, screen } from "@/utils/testing-library";

describe("SectionHeaderMobile", () => {
	it("should render", () => {
		render(<SectionHeaderMobile title="Test" />);

		expect(screen.getByTestId("SectionHeaderMobile__wrapper")).toBeTruthy();
	});

	it("should render title", () => {
		render(<SectionHeaderMobile title="Test title" />);

		expect(screen.getByText("Test title")).toBeTruthy();
	});
});

describe("SectionBodyItem", () => {
	it("should render", () => {
		render(
			<SectionBodyItem title="Test title">
				<div>Test</div>
			</SectionBodyItem>,
		);

		expect(screen.getByTestId("SectionBodyItem__wrapper")).toBeTruthy();
	});

	it("should render title", () => {
		render(
			<SectionBodyItem title="Test title">
				<div>Test</div>
			</SectionBodyItem>,
		);

		expect(screen.getByText("Test title")).toBeTruthy();
	});

	it("should render children", () => {
		render(
			<SectionBodyItem title="Test title">
				<div>Test</div>
			</SectionBodyItem>,
		);

		expect(screen.getByText("Test")).toBeTruthy();
	});
});
