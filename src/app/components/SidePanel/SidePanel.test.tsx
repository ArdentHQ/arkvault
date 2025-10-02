import React from "react";
import { SidePanel } from "./SidePanel";
import userEvent from "@testing-library/user-event";
import { render, screen, act } from "@testing-library/react";
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

	it("should display minimize button", async () => {
		render(
			<SidePanel open={true} onOpenChange={vi.fn()} title="side panel header">
				{" "}
				panel body{" "}
			</SidePanel>,
		);

		expect(screen.getByTestId("SidePanel__minimize-button")).toBeInTheDocument();
	});

	it("should detect scrollable content and apply footer shadow", () => {
		let resizeObserverCallback: ResizeObserverCallback;

		const observe = vi.fn();
		const disconnect = vi.fn();

		global.ResizeObserver = vi.fn((cb) => {
			resizeObserverCallback = cb;
			return { disconnect, observe };
		}) as unknown as typeof ResizeObserver;

		render(
			<SidePanel open={true} title="" onOpenChange={vi.fn()} footer={<div>footer</div>}>
				panel body
			</SidePanel>,
		);

		expect(screen.getByText("panel body")).toBeInTheDocument();

		const scrollableElement = screen.getByTestId("SidePanel__content");

		Object.defineProperty(scrollableElement, "scrollHeight", { configurable: true, get: () => 1000 });
		Object.defineProperty(scrollableElement, "clientHeight", { configurable: true, get: () => 500 });

		act(() => {
			resizeObserverCallback([{ target: scrollableElement } as ResizeObserverEntry], {} as ResizeObserver);
		});

		expect(screen.getByTestId("SidePanel__footer")).toHaveClass("shadow-footer-side-panel");
	});

	it("should not apply footer shadow when content is not scrollable", () => {
		let resizeObserverCallback: ResizeObserverCallback;

		const observe = vi.fn();
		const disconnect = vi.fn();

		global.ResizeObserver = vi.fn((cb) => {
			resizeObserverCallback = cb;
			return { disconnect, observe };
		}) as unknown as typeof ResizeObserver;

		render(
			<SidePanel open={true} title="" onOpenChange={vi.fn()} footer={<div>footer</div>}>
				panel body
			</SidePanel>,
		);

		expect(screen.getByText("panel body")).toBeInTheDocument();

		const scrollableElement = screen.getByTestId("SidePanel__content");

		Object.defineProperty(scrollableElement, "scrollHeight", { configurable: true, get: () => 500 });
		Object.defineProperty(scrollableElement, "clientHeight", { configurable: true, get: () => 1000 });

		act(() => {
			resizeObserverCallback([{ target: scrollableElement }], {} as ResizeObserver);
		});

		expect(screen.getByTestId("SidePanel__footer")).not.toHaveClass("shadow-footer-side-panel");
	});
});
