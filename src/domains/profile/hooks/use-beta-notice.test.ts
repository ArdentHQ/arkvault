import { act, renderHook } from "@testing-library/react-hooks";

import { useBetaNotice } from "./use-beta-notice";

describe("useBetaNotice", () => {
	it("should show beta notice if key is not set in local storage", () => {
		jest.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(undefined);

		const { result } = renderHook(() => useBetaNotice());

		expect(result.current.showBetaNotice).toBe(true);
	});

	it("should accept beta notice", () => {
		jest.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(undefined);

		const { result } = renderHook(() => useBetaNotice());

		expect(result.current.showBetaNotice).toBe(true);

		act(() => {
			result.current.acceptBetaNotice();
		});

		expect(result.current.showBetaNotice).toBe(false);
	});
});
