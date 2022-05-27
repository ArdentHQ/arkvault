/* eslint-disable @typescript-eslint/require-await */
import { isKnownPath, isAllowedUrl } from "./url-validation";
import { ProfilePaths } from "@/router/paths";

describe("Url validation", () => {
	it("#isKnownPath", async () => {
		expect(isKnownPath("/unkown")).toBe(false);
		expect(isKnownPath("/profiles/1/dashboard")).toBe(true);
	});

	it("#isAllowedUrl", async () => {
		expect(isAllowedUrl(ProfilePaths.Welcome)).toBe(true);
		expect(isAllowedUrl(ProfilePaths.ImportProfile)).toBe(true);
		expect(isAllowedUrl(ProfilePaths.CreateProfile)).toBe(true);
	});
});
