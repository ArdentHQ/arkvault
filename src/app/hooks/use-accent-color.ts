import { Contracts } from "@payvo/sdk-profiles";

type AccentColorType = "green" | "blue";

const ACCENT_BLUE_CLASS = "accent-blue"; // defined in variables.css

const getCurrentAccentColor = (): AccentColorType => {
	if (document.body.classList.contains(ACCENT_BLUE_CLASS)) {
		return "blue";
	}

	return "green";
};

const resetAccentColor = () => {
	document.body.classList.remove(ACCENT_BLUE_CLASS);
};

const useAccentColor = () => {
	const setAccentColor = (value: AccentColorType) => {
		if (value === "blue") {
			document.body.classList.add(ACCENT_BLUE_CLASS);
		}

		if (value === "green") {
			resetAccentColor();
		}
	};

	const setProfileAccentColor = (profile: Contracts.IProfile) => {
		const profileAccentColor = profile.settings().get(Contracts.ProfileSetting.AccentColor);

		/* istanbul ignore else */
		if (getCurrentAccentColor() !== profileAccentColor) {
			setAccentColor(profileAccentColor as AccentColorType);
		}
	};

	return {
		getCurrentAccentColor,
		resetAccentColor,
		setAccentColor,
		setProfileAccentColor,
	};
};

export { useAccentColor };

export type { AccentColorType };
