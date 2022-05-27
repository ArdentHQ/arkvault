import { Contracts } from "@payvo/sdk-profiles";

import { useAccentColor } from "@/app/hooks/use-accent-color";
import { env } from "@/utils/testing-library";

describe("useAccentColor", () => {
	beforeEach(() => {
		document.body.className = "";
	});

	describe("getCurrentAccentColor", () => {
		it("should return current accent color", () => {
			const { getCurrentAccentColor } = useAccentColor();

			expect(getCurrentAccentColor()).toBe("green");

			document.body.classList.add("accent-blue");

			expect(getCurrentAccentColor()).toBe("blue");
		});
	});

	describe("setAccentColor", () => {
		it("should correctly add the accent color class", () => {
			const { setAccentColor } = useAccentColor();

			expect(document.body.classList).toHaveLength(0);

			setAccentColor("blue");

			expect(document.body.classList).toContain("accent-blue");

			setAccentColor("green");

			expect(document.body.classList).not.toContain("accent-blue");
		});
	});

	describe("setProfileAccentColor", () => {
		it("should set the accent color according to profile settings", async () => {
			const { setProfileAccentColor, getCurrentAccentColor } = useAccentColor();

			expect(getCurrentAccentColor()).toBe("green");

			const profile = await env.profiles().create("empty profile");
			profile.settings().set(Contracts.ProfileSetting.AccentColor, "blue");

			setProfileAccentColor(profile);

			expect(getCurrentAccentColor()).toBe("blue");
		});
	});
});
