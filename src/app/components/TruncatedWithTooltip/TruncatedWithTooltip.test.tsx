import { vi } from "vitest";
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { TruncatedWithTooltip } from "./TruncatedWithTooltip";
import * as TooltipMock from "@/app/components/Tooltip";

describe("TruncatedWithTooltip", () => {
	beforeAll(() => {
		vi.spyOn(TooltipMock, "Tooltip").mockImplementation(({ content, disabled, children }) => (
			<span data-testid="tooltip-wrapper">
				{children}
				{!disabled && <span data-testid="tooltip-content">{content}</span>}
			</span>
		));
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("shows tooltip when text is truncated", async () => {
		let observerCallback;
		const ResizeObserverSpy = vi.fn().mockImplementation((callback) => {
			observerCallback = callback;
			return {
				disconnect: vi.fn(),
				observe: vi.fn(),
				unobserve: vi.fn(),
			};
		});
		global.ResizeObserver = ResizeObserverSpy;

		render(
			<div style={{ width: "50px" }}>
				<TruncatedWithTooltip text="LongTextForTruncation123" />
			</div>,
		);

		const textSpan = screen.getByText("LongTextForTruncation123");
		vi.spyOn(textSpan, "scrollWidth", "get").mockReturnValue(300);
		vi.spyOn(textSpan, "clientWidth", "get").mockReturnValue(40);

		act(() => {
			observerCallback([{ target: textSpan }]);
		});

		await waitFor(() => {
			expect(screen.getByTestId("tooltip-content")).toBeInTheDocument();
		});
	});

	it("does not show tooltip when text is not truncated", async () => {
		let observerCallback;
		const ResizeObserverSpy = vi.fn().mockImplementation((callback) => {
			observerCallback = callback;
			return {
				disconnect: vi.fn(),
				observe: vi.fn(),
				unobserve: vi.fn(),
			};
		});
		global.ResizeObserver = ResizeObserverSpy;

		render(
			<div style={{ width: "400px" }}>
				<TruncatedWithTooltip text="LongTextForTruncation123" />
			</div>,
		);

		const textSpan = screen.getByText("LongTextForTruncation123");
		vi.spyOn(textSpan, "scrollWidth", "get").mockReturnValue(300);
		vi.spyOn(textSpan, "clientWidth", "get").mockReturnValue(400);

		act(() => {
			observerCallback([{ target: textSpan }]);
		});

		await waitFor(() => {
			expect(screen.queryByTestId("tooltip-content")).not.toBeInTheDocument();
		});
	});

	it("updates tooltip state on resize", async () => {
		let observerCallback;
		const ResizeObserverSpy = vi.fn().mockImplementation((callback) => {
			observerCallback = callback;
			return {
				disconnect: vi.fn(),
				observe: vi.fn(),
				unobserve: vi.fn(),
			};
		});
		global.ResizeObserver = ResizeObserverSpy;

		const { rerender } = render(
			<div style={{ width: "50px" }}>
				<TruncatedWithTooltip text="LongTextForTruncation123" />
			</div>,
		);

		const textSpan = screen.getByText("LongTextForTruncation123");
		vi.spyOn(textSpan, "scrollWidth", "get").mockReturnValue(300);
		vi.spyOn(textSpan, "clientWidth", "get").mockReturnValue(40);

		act(() => {
			observerCallback([{ target: textSpan }]);
		});

		await waitFor(() => {
			expect(screen.getByTestId("tooltip-content")).toBeInTheDocument();
		});

		vi.spyOn(textSpan, "clientWidth", "get").mockReturnValue(400);

		rerender(
			<div style={{ width: "400px" }}>
				<TruncatedWithTooltip text="LongTextForTruncation123" />
			</div>,
		);

		act(() => {
			observerCallback([{ target: textSpan }]);
		});

		await waitFor(() => {
			expect(screen.queryByTestId("tooltip-content")).not.toBeInTheDocument();
		});
	});
});
