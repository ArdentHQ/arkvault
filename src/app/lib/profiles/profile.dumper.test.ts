import { describe, beforeEach, it, expect } from "vitest";
import { IProfile, IProfileDumper } from "./contracts";
import { ProfileDumper } from "./profile.dumper";
import { env, getMainsailProfileId } from "@/utils/testing-library";

describe("ProfileDumper", () => {
	let profile: IProfile;
	let subject: IProfileDumper;

	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		subject = new ProfileDumper(profile);
	});

	it("should throw an error if the profile has not been saved", () => {
		profile.getAttributes().forget("data");

		expect(() => subject.dump()).toThrow(
			`The profile [${profile.name()}] has not been encoded or encrypted. Please call [save] before dumping.`,
		);
	});

	it("should return the dumped data", () => {
		const password = "password";
		const data = "encrypted data";

		profile.getAttributes().set("password", password);
		profile.getAttributes().set("data", data);

		const result = subject.dump();

		expect(result).toHaveProperty("id");
		expect(result).toHaveProperty("name");
		expect(result).toHaveProperty("avatar");
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("appearance");
		expect(result).toHaveProperty("password");

		expect(result.id).toBe(profile.id());
		expect(result.name).toBe(profile.name());
		expect(result.avatar).toBe(profile.avatar());
		expect(result.data).toBe(data);
		expect(result.appearance).toEqual(profile.appearance().all());
		expect(result.password).toBe(password);
	});
});
