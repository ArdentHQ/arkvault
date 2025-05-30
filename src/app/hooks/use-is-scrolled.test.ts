import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";

import { useIsScrolled } from "./use-is-scrolled";

let resizeCallback: () => void = () => {};

describe("useIsScrolled", () => {
	const mockObserve = vi.fn();
	const mockDisconnect = vi.fn();

	beforeAll(() => {
		window.ResizeObserver = vi.fn().mockImplementation(() => ({
			disconnect: mockDisconnect,
			observe: mockObserve,
		}));
	});

	it("should return false when not active", () => {
		const scrollContainerRef = { current: document.createElement("div") };
		const { result } = renderHook(() =>
			useIsScrolled({
				active: false,
				scrollContainerRef,
			}),
		);
		expect(result.current).toBe(false);
	});

	it("should return false when element is not scrollable", () => {
		const scrollContainerRef = { current: document.createElement("div") };
		Object.defineProperty(scrollContainerRef.current, "scrollHeight", { value: 100 });
		Object.defineProperty(scrollContainerRef.current, "clientHeight", { value: 100 });

		const { result } = renderHook(() =>
			useIsScrolled({
				active: true,
				scrollContainerRef,
			}),
		);
		expect(result.current).toBe(false);
	});

	it("should return true when element is scrollable", () => {
		const scrollContainerRef = { current: document.createElement("div") };
		Object.defineProperty(scrollContainerRef.current, "scrollHeight", { value: 200 });
		Object.defineProperty(scrollContainerRef.current, "clientHeight", { value: 100 });

		const { result } = renderHook(() =>
			useIsScrolled({
				active: true,
				scrollContainerRef,
			}),
		);
		expect(result.current).toBe(true);
	});

	it("should observe resize when active", () => {
		const scrollContainerRef = { current: document.createElement("div") };
		renderHook(() =>
			useIsScrolled({
				active: true,
				scrollContainerRef,
			}),
		);
		expect(mockObserve).toHaveBeenCalledWith(scrollContainerRef.current);
	});

	it("should disconnect resize observer on unmount", () => {
		const scrollContainerRef = { current: document.createElement("div") };
		const { unmount } = renderHook(() =>
			useIsScrolled({
				active: true,
				scrollContainerRef,
			}),
		);
		unmount();
		expect(mockDisconnect).toHaveBeenCalled();
	});

	it("should update isScrolled on resize", () => {
		window.ResizeObserver = vi.fn().mockImplementation((callback) => {
			resizeCallback = callback;
			return {
				disconnect: mockDisconnect,
				observe: mockObserve,
			};
		});

		const scrollContainerRef = { current: document.createElement("div") };
		Object.defineProperty(scrollContainerRef.current, "scrollHeight", { value: 100, writable: true });
		Object.defineProperty(scrollContainerRef.current, "clientHeight", { value: 100, writable: true });

		const { result } = renderHook(() =>
			useIsScrolled({
				active: true,
				scrollContainerRef,
			}),
		);

		expect(result.current).toBe(false);

		act(() => {
			Object.defineProperty(scrollContainerRef.current, "scrollHeight", { value: 200 });
			// Simulate resize event
			resizeCallback();
		});

		expect(result.current).toBe(true);
	});
});
