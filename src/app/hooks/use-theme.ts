import { Contracts } from "@/app/lib/profiles";

import { Theme } from "@/types";
import { shouldUseDarkColors, shouldUseDimColors } from "@/utils/theme";
import { browser } from "@/utils/platform";
import { useCallback, useEffect, useState } from "react";

export type ViewingModeType = "light" | "dark" | "dim";

const setTheme = (theme: Theme) => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const htmlElement = document.querySelector("html")!;

	if (theme === "system") {
		const systemTheme: ViewingModeType = window.matchMedia("(prefers-color-scheme: dark)")?.matches
			? "dark"
			: "light";

		htmlElement.classList.remove("dark", "light", "dim");
		htmlElement.classList.add(systemTheme);

		if (!browser.supportsOverflowOverlay()) {
			document.documentElement.classList.remove(
				"firefox-scrollbar-dark",
				"firefox-scrollbar-light",
				"firefox-scrollbar-dim",
			);
			document.documentElement.classList.add(`firefox-scrollbar-${systemTheme}`);
		}

		htmlElement.dispatchEvent(new CustomEvent("themeChanged", { detail: systemTheme }));

		return;
	}

	switch (theme) {
		case "dim": {
			htmlElement.classList.remove("light");
			htmlElement.classList.add("dark", "dim");

			break;
		}
		case "dark": {
			htmlElement.classList.remove("light", "dim");
			htmlElement.classList.add("dark");

			break;
		}
		case "light": {
			htmlElement.classList.remove("dark", "dim");
			htmlElement.classList.add("light");

			break;
		}
	}

	htmlElement.dispatchEvent(new CustomEvent("themeChanged", { detail: theme }));

	if (!browser.supportsOverflowOverlay()) {
		document.documentElement.classList.remove(
			"firefox-scrollbar-dark",
			"firefox-scrollbar-light",
			"firefox-scrollbar-dim",
		);
		document.documentElement.classList.add(`firefox-scrollbar-${theme}`);
	}
};

const resetTheme = () => setTheme("system");

export const useTheme: () => {
	resetProfileTheme: (profile: Contracts.IProfile) => void;
	setTheme: (theme: Theme) => void;
	isDarkMode: boolean;
	isDimMode: boolean;
	resetTheme: () => void;
	theme: ViewingModeType;
	setProfileTheme: (profile: Contracts.IProfile) => void;
} = () => {
	const getInitialTheme = (): ViewingModeType => {
		if (shouldUseDimColors()) {
			return "dim";
		}
		if (shouldUseDarkColors()) {
			return "dark";
		}
		return "light";
	};

	const [theme, setCurrentTheme] = useState<ViewingModeType>(getInitialTheme());

	const isDarkMode = theme === "dark";
	const isDimMode = theme === "dim";

	const onThemeChange = useCallback((data: CustomEvent) => {
		setCurrentTheme(data.detail as ViewingModeType);
	}, []);

	useEffect(() => {
		const htmlElement = document.querySelector("html");

		htmlElement?.addEventListener("themeChanged", onThemeChange as EventListener);

		return () => {
			htmlElement?.removeEventListener("themeChanged", onThemeChange as EventListener);
		};
	}, [onThemeChange]);

	const setProfileTheme = (profile: Contracts.IProfile) => {
		const profileTheme = profile.appearance().get("theme") as Theme;

		setTheme(profileTheme);
	};

	const resetProfileTheme = (profile: Contracts.IProfile) => {
		resetTheme();

		profile.settings().set(Contracts.ProfileSetting.Theme, shouldUseDarkColors() ? "dark" : "light");
	};

	return { isDarkMode, isDimMode, resetProfileTheme, resetTheme, setProfileTheme, setTheme, theme };
};
