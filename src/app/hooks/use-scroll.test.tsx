import { act, renderHook } from "@testing-library/react";

import { useScroll } from "./use-scroll";

let eventMap: any;

describe("useScroll", () => {
	beforeEach(() => {
		eventMap = {};

		vi.spyOn(window, "addEventListener").mockImplementation((eventName, callback) => {
			eventMap[eventName] = callback;
		});
	});

	afterEach(() => {
		vi.spyOn(window, "removeEventListener").mockImplementation((eventName) => {
			delete eventMap[eventName];
		});
	});

	it("should return window scroll offset", () => {
		const { result } = renderHook(() => useScroll());

		act(() => {
			eventMap.scroll();
		});

		expect(result.current.valueOf()).toBe(0);
	});
});
