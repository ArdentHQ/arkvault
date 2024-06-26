import { renderHook } from "@testing-library/react";
import { useLink } from "./use-link";

describe("useLink", () => {
	it("should return a function to open external links in a new tab", () => {
		const windowOpen = vi.spyOn(window, "open").mockImplementation(vi.fn());

		const { result } = renderHook(() => useLink());

		result.current.openExternal("https://ark.io");

		expect(windowOpen).toHaveBeenCalledWith(new URL("https://ark.io").toString(), "_blank");

		windowOpen.mockRestore();
	});

	it("should throw error when link is not valid", () => {
		const { result } = renderHook(() => useLink());

		expect(() => result.current.openExternal("ark.io")).toThrow(`"ark.io" is not a valid URL`);
	});
});
