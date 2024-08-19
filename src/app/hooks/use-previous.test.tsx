import { renderHook } from "@testing-library/react";

import { usePrevious } from "./use-previous";

describe("Previous Hook", () => {
	it("Should render the usePrevious hook", () => {
		const { result } = renderHook(() => usePrevious({ result: { current: true } }));

		expect(result).toBeTruthy();
	});
});
