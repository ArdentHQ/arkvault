import React from "react";
import { SidePanel } from "./SidePanel";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { Icon } from "@/app/components/Icon";

describe("SidePanel", () => {
	it("should render title", () => {
		render(
			<SidePanel open={true} onOpenChange={vi.fn()} title="side panel header">
				{" "}
				panel body{" "}
			</SidePanel>,
		);

		expect(screen.getByText("side panel header")).toBeInTheDocument();
	});

	it("should render title icon", () => {
		render(
			<SidePanel
				open={true}
				onOpenChange={vi.fn()}
				title="side panel header"
				titleIcon={<Icon name="test" data-testid="test-icon" />}
			>
				{" "}
				panel body{" "}
			</SidePanel>,
		);

		expect(screen.getByTestId("test-icon")).toBeInTheDocument();
	});

	it("should render subtitle", () => {
		render(
			<SidePanel open={true} onOpenChange={vi.fn()} title="side panel header" subtitle="side panel subtitle">
				{" "}
				panel body{" "}
			</SidePanel>,
		);

		expect(screen.getByText("side panel subtitle")).toBeInTheDocument();
	});

	it("should display steps if hasSteps is true", () => {
		render(
			<SidePanel
				open={true}
				onOpenChange={vi.fn()}
				title="side panel header"
				hasSteps={true}
				totalSteps={3}
				activeStep={1}
			>
				{" "}
				panel body{" "}
			</SidePanel>,
		);

		expect(screen.getAllByTestId("SidePanelStyledStep")).toHaveLength(3);
		expect(screen.getAllByTestId("SidePanelStyledStep")[0]).toHaveClass("bg-theme-warning-300");
	});

	it("should not display steps if hasSteps is false", () => {
		render(
			<SidePanel
				open={true}
				onOpenChange={vi.fn()}
				title="side panel header"
				hasSteps={false}
				totalSteps={5}
				activeStep={3}
			>
				{" "}
				panel body{" "}
			</SidePanel>,
		);

		expect(screen.queryAllByTestId("SidePanelStyledStep")).toHaveLength(0);
	});

	it("should render body", () => {
		render(
			<SidePanel open={true} onOpenChange={vi.fn()}>
				{" "}
				panel body{" "}
			</SidePanel>,
		);

		expect(screen.getByText("panel body")).toBeInTheDocument();
	});

	it("should close the panel", async () => {
		const onOpenChangeMock = vi.fn();
		render(
			<SidePanel open={true} onOpenChange={onOpenChangeMock}>
				{" "}
				panel body{" "}
			</SidePanel>,
		);

		expect(screen.getByText("panel body")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("SidePanel__close-button"));

		expect(onOpenChangeMock).toHaveBeenCalledWith(false);
	});
});
