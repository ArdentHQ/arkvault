import { Contracts } from "@ardenthq/sdk-profiles";

import { useAccentColor } from "@/app/hooks/use-accent-color";
import { env } from "@/utils/testing-library";

const ACCENT_GREEN_CLASS = "accent-green";
const ACCENT_NAVY_CLASS = "accent-navy";

describe("useAccentColor", () => {
	beforeEach(() => {
		document.body.className = ACCENT_NAVY_CLASS;
	});

	describe("getCurrentAccentColor", () => {
		it("should return current accent color", () => {
			const { getCurrentAccentColor } = useAccentColor();

			expect(getCurrentAccentColor()).toBe("navy");

			document.body.classList.remove(ACCENT_NAVY_CLASS);
			document.body.classList.add(ACCENT_GREEN_CLASS);

			expect(getCurrentAccentColor()).toBe("green");
		});
	});

	describe("setAccentColor", () => {
		it("should correctly add the accent color class", () => {
			const { setAccentColor } = useAccentColor();

			expect(document.body.classList).toHaveLength(1);
			expect(document.body.classList.contains(ACCENT_NAVY_CLASS)).toBeTrue();

			setAccentColor("green");

			expect(document.body.classList.contains(ACCENT_GREEN_CLASS)).toBeTrue();
			expect(document.body.classList.contains(ACCENT_NAVY_CLASS)).toBeFalse();

			setAccentColor("navy");

			expect(document.body.classList.contains(ACCENT_GREEN_CLASS)).toBeFalse();
			expect(document.body.classList.contains(ACCENT_NAVY_CLASS)).toBeTrue();
		});
	});

	describe("setProfileAccentColor", () => {
		it("should set the accent color according to profile settings", async () => {
			const { setProfileAccentColor, getCurrentAccentColor } = useAccentColor();

			expect(getCurrentAccentColor()).toBe("navy");

			const profile = await env.profiles().create("empty profile");
			profile.settings().set(Contracts.ProfileSetting.AccentColor, "green");

			setProfileAccentColor(profile);

			expect(getCurrentAccentColor()).toBe("green");

			env.profiles().forget(profile.id());
		});

		it("should replace blue color with navy", async () => {
			document.body.className = ACCENT_GREEN_CLASS;

			const { setProfileAccentColor, getCurrentAccentColor } = useAccentColor();

			expect(getCurrentAccentColor()).toBe("green");

			const profile = await env.profiles().create("empty profile");
			profile.settings().set(Contracts.ProfileSetting.AccentColor, "blue");

			setProfileAccentColor(profile);

			expect(getCurrentAccentColor()).toBe("navy");

			env.profiles().forget(profile.id());
		});
	});
});
