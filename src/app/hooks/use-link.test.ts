import { renderHook } from "@testing-library/react-hooks";
import { useLink } from "./use-link";

describe("useLink", () => {
	it("should return a function to open external links in a new tab", () => {
		const windowOpen = jest.spyOn(window, "open").mockImplementation();

		const { result } = renderHook(() => useLink());

		result.current.openExternal("https://ark.io");

		expect(windowOpen).toHaveBeenCalledWith(new URL("https://ark.io").toString(), "_blank");

		windowOpen.mockRestore();
	});

	it("should throw error when link is not valid", () => {
		const { result } = renderHook(() => useLink());

		expect(() => result.current.openExternal("ark.io")).toThrow(`"ark.io" is not a valid URL`);
	});

	it("should return a function to open mailto links", () => {
		const windowOpen = jest.spyOn(window, "open").mockImplementation();

		const { result } = renderHook(() => useLink());

		result.current.openMailto("mailto:contact@arkvault.io");

		expect(windowOpen).toHaveBeenCalledWith(new URL("mailto:contact@arkvault.io").toString());

		windowOpen.mockRestore();
	});

	it("should throw error when mailto is not valid", () => {
		const { result } = renderHook(() => useLink());

		expect(() => result.current.openMailto("contact@arkvault.io")).toThrow(
			`"contact@arkvault.io" is not a valid mailto URL`,
		);
	});
});
