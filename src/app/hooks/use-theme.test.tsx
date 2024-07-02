/* eslint-disable testing-library/no-node-access */
import { Contracts } from "@ardenthq/sdk-profiles";

import { useTheme } from "@/app/hooks/use-theme";
import { Theme } from "@/types";
import { browser } from "@/utils/platform";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import * as themeUtils from "@/utils/theme";

describe("useTheme", () => {
	describe("theme", () => {
		it("should return 'dark' if shouldUseDarkColors is true", () => {
			vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementationOnce(() => true);

			expect(useTheme().theme).toBe("dark");
		});

		it("should return 'light' if shouldUseDarkColors is false", () => {
			vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementationOnce(() => false);

			expect(useTheme().theme).toBe("light");
		});
	});

	describe("isDarkMode", () => {
		it("should return true if dark mode", () => {
			vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementationOnce(() => true);

			expect(useTheme().isDarkMode).toBe(true);
		});

		it("should return false if not dark mode", () => {
			vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementationOnce(() => false);

			expect(useTheme().isDarkMode).toBe(false);
		});
	});

	describe("setTheme", () => {
		it.each(["light", "dark"])("should set %s theme", (theme) => {
			useTheme().setTheme(theme === "light" ? "dark" : "light");

			expect(document.querySelector("html").classList.contains(theme)).toBe(false);

			useTheme().setTheme(theme);

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

			useTheme().setTheme("system");

			expect(document.querySelector("html").classList.contains("light")).toBe(false);
			expect(document.querySelector("html").classList.contains("dark")).toBe(true);
			expect(document.documentElement.classList.contains("firefox-scrollbar-light")).toBe(false);
			expect(document.documentElement.classList.contains("firefox-scrollbar-dark")).toBe(true);

			overflowOverlayMock.mockRestore();
		});

		it("should add firefox classes to the html element if overflow overlay is not supported", () => {
			const overflowOverlayMock = vi.spyOn(browser, "supportsOverflowOverlay");

			overflowOverlayMock.mockReturnValue(false);

			useTheme().setTheme("light");

			expect(document.documentElement.classList.contains("firefox-scrollbar-light")).toBe(true);

			useTheme().setTheme("dark");

			expect(document.documentElement.classList.contains("firefox-scrollbar-dark")).toBe(true);

			overflowOverlayMock.mockReturnValue(true);

			useTheme().setTheme("light");

			expect(document.documentElement.classList.contains("firefox-scrollbar-light")).toBe(false);

			overflowOverlayMock.mockRestore();
		});
	});

	describe("setProfileTheme", () => {
		it("should set theme from profile settings", async () => {
			const profile = env.profiles().findById(getDefaultProfileId());
			await env.profiles().restore(profile);

			useTheme().setTheme("dark");

			expect(document.querySelector("html").classList.contains("dark")).toBe(true);
			expect(document.querySelector("html").classList.contains("light")).toBe(false);

			useTheme().setProfileTheme(profile);

			expect(document.querySelector("html").classList.contains("dark")).toBe(false);
			expect(document.querySelector("html").classList.contains("light")).toBe(true);
		});

		it("should not set theme from profile settings", async () => {
			const profile = env.profiles().findById(getDefaultProfileId());
			await env.profiles().restore(profile);

			const themeHook = useTheme();

			themeHook.setTheme("light");

			const themeSpy = vi.spyOn(themeHook, "setTheme");

			expect(document.querySelector("html").classList.contains("light")).toBe(true);

			themeHook.setProfileTheme(profile);

			expect(document.querySelector("html").classList.contains("light")).toBe(true);

			expect(themeSpy).not.toHaveBeenCalledWith();

			themeSpy.mockRestore();
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

			const { resetProfileTheme, setTheme } = useTheme();

			setTheme(systemTheme);

			expect(document.querySelector("html").classList.contains(systemTheme)).toBe(true);

			profile.settings().set(Contracts.ProfileSetting.Theme, profileTheme);
			setTheme(profileTheme as Theme);

			expect(document.querySelector("html").classList.contains(profileTheme)).toBe(true);

			resetProfileTheme(profile);

			expect(document.querySelector("html").classList.contains(systemTheme)).toBe(true);
			expect(profile.appearance().get("theme")).toBe(systemTheme);
		});
	});

	describe("resetTheme", () => {
		it("should reset theme to defaults", () => {
			expect(document.querySelector("html").classList.contains("light")).toBe(true);

			useTheme().setTheme("dark");

			expect(document.querySelector("html").classList.contains("dark")).toBe(true);

			useTheme().resetTheme();

			expect(document.querySelector("html").classList.contains("light")).toBe(true);
		});
	});
});
