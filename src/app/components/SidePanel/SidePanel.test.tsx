import React from "react";
import { SidePanel } from "./SidePanel";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

describe("SidePanel", () => {
	it("should render string header", () => {
		render(
			<SidePanel open={true} onOpenChange={vi.fn()} header="side panel header">
				{" "}
				panel body{" "}
			</SidePanel>,
		);

		expect(screen.getByText("side panel header")).toBeInTheDocument();
	});

	it("should render component header", () => {
		render(
			<SidePanel open={true} onOpenChange={vi.fn()} header={<div>side panel header</div>}>
				{" "}
				panel body{" "}
			</SidePanel>,
		);

		expect(screen.getByText("side panel header")).toBeInTheDocument();
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
