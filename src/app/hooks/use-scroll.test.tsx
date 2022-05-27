import { act, renderHook } from "@testing-library/react-hooks";

import { useScroll } from "./use-scroll";

let eventMap: any;

describe("useScroll", () => {
	beforeEach(() => {
		eventMap = {};

		jest.spyOn(window, "addEventListener").mockImplementation((eventName, callback) => {
			eventMap[eventName] = callback;
		});
	});

	afterEach(() => {
		jest.spyOn(window, "removeEventListener").mockImplementation((eventName) => {
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
