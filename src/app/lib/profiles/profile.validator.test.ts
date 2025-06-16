import { beforeEach, describe, expect, it } from "vitest";

import { IProfileData } from "./contracts.js";
import { ProfileValidator } from "./profile.validator.js";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { ProfileSerialiser } from "./profile.serialiser.js";

let subject: ProfileValidator;
let validProfile: IProfileData;

beforeEach(() => {
	subject = new ProfileValidator();
	const profile = env.profiles().findById(getMainsailProfileId());
	validProfile = new ProfileSerialiser(profile).toJSON();
});

describe("ProfileValidator", () => {
	it("should pass with a valid profile", () => {
		const result = subject.validate(validProfile);
		expect(result).toBeDefined();
		expect(result.id).toBe(validProfile.id);
	});

	it("should throw with an invalid profile", () => {
		const invalidProfile = { ...validProfile };
		// @ts-ignore
		delete invalidProfile.id;

		expect(() => subject.validate(invalidProfile as IProfileData)).toThrow(/"id" is required/);
	});
});
