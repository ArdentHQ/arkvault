/* eslint-disable @typescript-eslint/require-await */
import { renderHook } from "@testing-library/react-hooks";
import { usePlatform } from "./use-platform";

describe("usePlatform", () => {
	it("should determine if the platform is ios", () => {
		const navigatorSpy = vi
			.spyOn(navigator, "userAgent", "get")
			.mockReturnValue(
				"Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1",
			);

		const { result } = renderHook(() => usePlatform());

		expect(result.current.isIos()).toBe(true);

		navigatorSpy.mockReset();
	});

	it("should determine if the platform is not ios", () => {
		const navigatorSpy = vi
			.spyOn(navigator, "userAgent", "get")
			.mockReturnValue(
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.61 Safari/537.36",
			);

		const { result } = renderHook(() => usePlatform());

		expect(result.current.isIos()).toBe(false);

		navigatorSpy.mockReset();
	});

	it("should determine if is using webapp", () => {
		const windowSpy = vi.spyOn(window, "navigator", "get").mockReturnValue({ standalone: true } as any);

		const { result } = renderHook(() => usePlatform());

		expect(result.current.isWebapp()).toBe(true);

		windowSpy.mockReset();
	});

	it("should determine if is using webapp on chrome", () => {
		const windowSpy = vi.spyOn(window, "matchMedia").mockImplementation(() => ({ matches: true }) as any);

		const { result } = renderHook(() => usePlatform());

		expect(result.current.isWebapp()).toBe(true);

		windowSpy.mockReset();
	});

	it("should determine if is not using webapp", () => {
		const windowSpy = vi.spyOn(window, "matchMedia").mockImplementation(() => ({ matches: false }) as any);
		const windowSpy2 = vi.spyOn(window, "navigator", "get").mockReturnValue({} as any);

		const { result } = renderHook(() => usePlatform());

		expect(result.current.isWebapp()).toBe(false);

		windowSpy.mockReset();
		windowSpy2.mockReset();
	});
});
