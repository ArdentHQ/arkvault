/* eslint-disable @typescript-eslint/require-await */
import { isKnownPath, isAllowedUrl, isDisabledUrl } from "./url-validation";
import { ProfilePaths } from "@/router/paths";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { generatePath } from "react-router-dom";

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

	it("#isDisabledUrl", async () => {
		const emptyProfile = await env.profiles().create("empty profile");

		await env.profiles().restore(emptyProfile);
		await emptyProfile.sync();

		// should return profile id when given profile has no addresses
		expect(isDisabledUrl(generatePath(ProfilePaths.Tokens, { profileId: emptyProfile.id() }), env)).toBe(
			emptyProfile.id(),
		);

		// should return false when given profile has addresses
		expect(isDisabledUrl(generatePath(ProfilePaths.Tokens, { profileId: getMainsailProfileId() }), env)).toBe(
			false,
		);

		// should return false when path is not profile path
		expect(isDisabledUrl(generatePath(ProfilePaths.Welcome), env)).toBe(false);

		// should return false when profile id is invalid
		expect(isDisabledUrl(generatePath(ProfilePaths.Tokens, { profileId: "1" }), env)).toBe(false);

		// should return false when given path is not tokens, exchange or votes
		expect(isDisabledUrl(generatePath(ProfilePaths.Contacts, { profileId: emptyProfile.id() }), env)).toBe(
			undefined
		);
	});
});
