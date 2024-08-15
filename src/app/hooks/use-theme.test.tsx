/* eslint-disable testing-library/no-node-access */
import { Contracts } from "@ardenthq/sdk-profiles";

import { useTheme, ViewingModeType } from "@/app/hooks/use-theme";
import { Theme } from "@/types";
import * as themeUtils from "@/utils/theme";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { browser } from "@/utils/platform";
import { renderHook } from "@testing-library/react-hooks";

describe("useTheme", () => {
	describe("theme", () => {
		it("should return 'dark' if shouldUseDarkColors is true", () => {
			vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementationOnce(() => true);

			const {
				result: { current },
			} = renderHook(() => useTheme());

			expect(current.theme).toBe("dark");
		});

		it("should return 'light' if shouldUseDarkColors is false", () => {
			vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementationOnce(() => false);

			const {
				result: { current },
			} = renderHook(() => useTheme());

			expect(current.theme).toBe("light");
		});
	});

	describe("isDarkMode", () => {
		it("should return true if dark mode", () => {
			vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementationOnce(() => true);

			const {
				result: { current },
			} = renderHook(() => useTheme());

			expect(current.isDarkMode).toBe(true);
		});

		it("should return false if not dark mode", () => {
			vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementationOnce(() => false);

			const {
				result: { current },
			} = renderHook(() => useTheme());

			expect(current.isDarkMode).toBe(false);
		});
	});

	describe("setTheme", () => {
		it.each(["light", "dark"])("should set %s theme", (theme) => {
			const {
				result: { current },
			} = renderHook(() => useTheme());

			current.setTheme(theme === "light" ? "dark" : "light");

			expect(document.querySelector("html").classList.contains(theme)).toBe(false);

			current.setTheme(theme as ViewingModeType);

			expect(document.querySelector("html").classList.contains(theme)).toBe(true);
		});

		it("should set system theme", () => {
			const overflowOverlayMock = vi.spyOn(browser, "supportsOverflowOverlay").mockReturnValue(false);

			Object.defineProperty(window, "matchMedia", {
				value: vi.fn().mockImplementation((query) => ({
					// Deprecated
					addEventListener: vi.fn(),

					addListener: vi.fn(),

					dispatchEvent: vi.fn(),

					matches: "dark",

					media: query,

					onchange: null,

					removeEventListener: vi.fn(),
					// Deprecated
					removeListener: vi.fn(),
				})),
				writable: true,
			});

			const {
				result: { current },
			} = renderHook(() => useTheme());
			current.setTheme("system");

			expect(document.querySelector("html").classList.contains("light")).toBe(false);
			expect(document.querySelector("html").classList.contains("dark")).toBe(true);
			expect(document.documentElement.classList.contains("firefox-scrollbar-light")).toBe(false);
			expect(document.documentElement.classList.contains("firefox-scrollbar-dark")).toBe(true);

			overflowOverlayMock.mockRestore();
		});

		it("should add firefox classes to the html element if overflow overlay is not supported", () => {
			const overflowOverlayMock = vi.spyOn(browser, "supportsOverflowOverlay");

			overflowOverlayMock.mockReturnValue(false);

			const {
				result: { current },
			} = renderHook(() => useTheme());
			current.setTheme("light");

			expect(document.documentElement.classList.contains("firefox-scrollbar-light")).toBe(true);

			current.setTheme("dark");

			expect(document.documentElement.classList.contains("firefox-scrollbar-dark")).toBe(true);

			overflowOverlayMock.mockReturnValue(true);

			current.setTheme("light");

			expect(document.documentElement.classList.contains("firefox-scrollbar-light")).toBe(false);

			overflowOverlayMock.mockRestore();
		});
	});

	describe("setProfileTheme", () => {
		it("should set theme from profile settings", async () => {
			const profile = env.profiles().findById(getDefaultProfileId());
			await env.profiles().restore(profile);

			const {
				result: { current },
			} = renderHook(() => useTheme());
			current.setTheme("dark");

			expect(document.querySelector("html").classList.contains("dark")).toBe(true);
			expect(document.querySelector("html").classList.contains("light")).toBe(false);

			current.setProfileTheme(profile);

			expect(document.querySelector("html").classList.contains("dark")).toBe(false);
			expect(document.querySelector("html").classList.contains("light")).toBe(true);
		});

		it("should not set theme from profile settings", async () => {
			const profile = env.profiles().findById(getDefaultProfileId());
			await env.profiles().restore(profile);

			const {
				result: { current },
			} = renderHook(() => useTheme());

			current.setTheme("light");

			expect(document.querySelector("html").classList.contains("light")).toBe(true);

			current.setProfileTheme(profile);

			expect(document.querySelector("html").classList.contains("light")).toBe(true);
		});
	});

	describe("resetProfileTheme", () => {
		it.each([
			["light", "dark"],
			["dark", "light"],
		])("should reset profile %s theme to defaults", async (profileTheme, systemTheme) => {
			Object.defineProperty(window, "matchMedia", {
				value: vi.fn().mockImplementation(() => ({
					matches: systemTheme === "dark",
				})),
			});

			const profile = env.profiles().findById(getDefaultProfileId());
			await env.profiles().restore(profile);

			const {
				result: { current },
			} = renderHook(() => useTheme());

			current.setTheme(systemTheme);

			expect(document.querySelector("html").classList.contains(systemTheme)).toBe(true);

			profile.settings().set(Contracts.ProfileSetting.Theme, profileTheme);
			current.setTheme(profileTheme as Theme);

			expect(document.querySelector("html").classList.contains(profileTheme)).toBe(true);

			current.resetProfileTheme(profile);

			expect(document.querySelector("html").classList.contains(systemTheme)).toBe(true);
			expect(profile.appearance().get("theme")).toBe(systemTheme);
		});
	});

	describe("resetTheme", () => {
		it("should reset theme to defaults", () => {
			expect(document.querySelector("html").classList.contains("light")).toBe(true);

			const {
				result: { current },
			} = renderHook(() => useTheme());
			current.setTheme("dark");

			expect(document.querySelector("html").classList.contains("dark")).toBe(true);

			current.resetTheme();

			expect(document.querySelector("html").classList.contains("light")).toBe(true);
		});
	});
});
