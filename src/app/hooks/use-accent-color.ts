import { Contracts } from "@ardenthq/sdk-profiles";

type AccentColorType = "green" | "navy";

const ACCENT_GREEN_CLASS = "accent-green"; // defined in variables.css
const ACCENT_NAVY_CLASS = "accent-navy"; // defined in variables.css

const getCurrentAccentColor = (): AccentColorType => {
	if (document.body.classList.contains(ACCENT_NAVY_CLASS)) {
		return "navy";
	}

	return "green";
};

const resetAccentColor = () => {
	document.body.classList.remove(ACCENT_GREEN_CLASS);
	document.body.classList.add(ACCENT_NAVY_CLASS);
};

const useAccentColor = () => {
	const setAccentColor = (value: AccentColorType) => {
		if (value === "green") {
			document.body.classList.remove(ACCENT_NAVY_CLASS);
			document.body.classList.add(ACCENT_GREEN_CLASS);
		}

		if (value === "navy") {
			resetAccentColor();
		}
	};

	const setProfileAccentColor = (profile: Contracts.IProfile) => {
		let profileAccentColor = profile.settings().get(Contracts.ProfileSetting.AccentColor);

		if (profileAccentColor === "blue") {
			profileAccentColor = "navy";
		}

		/* istanbul ignore else -- @preserve */
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
