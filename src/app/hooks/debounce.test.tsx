import { act, renderHook } from "@testing-library/react-hooks";

import { useDebounce } from "./debounce";

describe("useDebounce", () => {
	it("should render useDebounce", () => {
		jest.useFakeTimers();

		const { result } = renderHook(() => useDebounce("query", 2000));

		// loading
		expect(result.current[1]).toBeTruthy();

		act(() => {
			jest.runAllTimers();
		});

		expect(result.current[1]).toBeFalsy();
	});
});
