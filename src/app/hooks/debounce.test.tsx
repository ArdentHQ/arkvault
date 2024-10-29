import { act, renderHook } from "@testing-library/react";

import { useDebounce } from "./debounce";

describe("useDebounce", () => {
	it("should render useDebounce", () => {
		vi.useFakeTimers();

		const { result } = renderHook(() => useDebounce("query", 2000));

		// loading
		expect(result.current[1]).toBeTruthy();

		act(() => {
			vi.runAllTimers();
		});

		expect(result.current[1]).toBeFalsy();
	});
});
