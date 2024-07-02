import { Contracts } from "@ardenthq/sdk-profiles";

import { Theme } from "@/types";
import { browser } from "@/utils/platform";
import { shouldUseDarkColors } from "@/utils/theme";

export type ViewingModeType = "light" | "dark";

const setTheme = (theme: Theme) => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const htmlElement = document.querySelector("html")!;

	if (theme === "system") {
		const theme: ViewingModeType = window.matchMedia("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";

		htmlElement.classList.remove("dark");
		htmlElement.classList.remove("light");
		htmlElement.classList.add(theme);

		if (!browser.supportsOverflowOverlay()) {
			document.documentElement.classList.remove("firefox-scrollbar-dark");
			document.documentElement.classList.remove("firefox-scrollbar-light");
			document.documentElement.classList.add(`firefox-scrollbar-${theme}`);
		}

		return;
	}

	htmlElement.classList.remove(theme === "dark" ? "light" : "dark");
	htmlElement.classList.add(theme);

	if (!browser.supportsOverflowOverlay()) {
		document.documentElement.classList.remove(
			theme === "dark" ? "firefox-scrollbar-light" : "firefox-scrollbar-dark",
		);
		document.documentElement.classList.add(`firefox-scrollbar-${theme}`);
	}
};

const resetTheme = () => setTheme("system");

export const useTheme: () => {
	resetProfileTheme: (profile: Contracts.IProfile) => void;
	setTheme: (theme: Theme) => void;
	isDarkMode: boolean;
	resetTheme: () => void;
	theme: "light" | "dark";
	setProfileTheme: (profile: Contracts.IProfile) => void;
} = () => {
	const theme: ViewingModeType = shouldUseDarkColors() ? "dark" : "light";
	const isDarkMode = theme === "dark";

	const setProfileTheme = (profile: Contracts.IProfile) => {
		const profileTheme = profile.appearance().get("theme");
		const hasDifferentTheme = shouldUseDarkColors() !== (profileTheme === "dark");

		/* istanbul ignore else -- @preserve */
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (hasDifferentTheme || !document.querySelector("html")!.classList.contains(theme)) {
			setTheme(profileTheme as Theme);
		}
	};

	const resetProfileTheme = (profile: Contracts.IProfile) => {
		resetTheme();

		profile.settings().set(Contracts.ProfileSetting.Theme, shouldUseDarkColors() ? "dark" : "light");
	};

	return { isDarkMode, resetProfileTheme, resetTheme, setProfileTheme, setTheme, theme };
};
