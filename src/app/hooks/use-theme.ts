import { Contracts } from "@payvo/sdk-profiles";

import { Theme } from "@/types";
import { shouldUseDarkColors } from "@/utils/theme";
import { browser } from "@/utils/platform";

export type ViewingModeType = "light" | "dark";

const setTheme = (theme: Theme) => {
	if (theme === "system") {
		const theme: ViewingModeType = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

		document.body.classList.remove("dark");
		document.body.classList.remove("light");
		document.body.classList.add(theme);

		if (!browser.supportsOverflowOverlay()) {
			document.documentElement.classList.remove("firefox-scrollbar-dark");
			document.documentElement.classList.remove("firefox-scrollbar-light");
			document.documentElement.classList.add(`firefox-scrollbar-${theme}`);
		}

		return;
	}

	document.body.classList.remove(theme === "dark" ? "light" : "dark");
	document.body.classList.add(theme);

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

		/* istanbul ignore else */
		if (hasDifferentTheme || !document.body.classList.contains(theme)) {
			setTheme(profileTheme as Theme);
		}
	};

	const resetProfileTheme = (profile: Contracts.IProfile) => {
		resetTheme();

		profile.settings().set(Contracts.ProfileSetting.Theme, shouldUseDarkColors() ? "dark" : "light");
	};

	return { isDarkMode, resetProfileTheme, resetTheme, setProfileTheme, setTheme, theme };
};
