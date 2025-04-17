import { describe } from "@ardenthq/sdk-test";

import { PROFILE_PASSWORD } from "../test/profiles";
import { AttributeBag } from "./helpers/attribute-bag";
import { ProfileEncrypter } from "./profile.encrypter";

describe("ProfileEncrypter #encrypt", ({ it, assert }) => {
	it("should work with provided password", async () => {
		let verifyCalledWith = "";

		const profile = {
			auth: () => ({
				verifyPassword: (password) => {
					verifyCalledWith = password;
					return true;
				},
			}),
		};

		const subject = new ProfileEncrypter(profile as any);

		assert.string(await subject.encrypt("blah", "some pass"));
		assert.is(verifyCalledWith, "some pass");
	});

	it("should not work with invalid password", async () => {
		let verifyCalledWith = "";

		const profile = {
			auth: () => ({
				verifyPassword: (password) => {
					verifyCalledWith = password;
					return false;
				},
			}),
		};

		const subject = new ProfileEncrypter(profile as any);

		await assert.rejects(() => subject.encrypt("blah", "some pass"));
		assert.is(verifyCalledWith, "some pass");
	});

	it("should use provided password if available", async () => {
		const profile = {
			auth: () => ({
				verifyPassword: () => true,
			}),
			password: () => ({
				exists: () => true,
				forget: () => {},
				get: () => "some pass",
				set: () => {},
			}),
		};

		const subject = new ProfileEncrypter(profile as any);

		assert.string(await subject.encrypt("blah"));
	});
});

describe("ProfileEncrypter #decrypt", ({ it, assert }) => {
	it("should work with provided password", async () => {
		const attributes = new AttributeBag();
		attributes.set("data", PROFILE_PASSWORD);

		const profile = {
			getAttributes: () => attributes,
			usesPassword: () => true,
		};

		const subject = new ProfileEncrypter(profile as any);

		const decrypted = await subject.decrypt("some pass");
		assert.is(decrypted.id, "4b26ccc4-3015-401f-9644-cf29a67998d4");
	});

	it("should failed if profile is not encrypted", async () => {
		const profile = { usesPassword: () => false };

		const subject = new ProfileEncrypter(profile as any);

		await assert.rejects(() => subject.decrypt("some pass"));
	});
});
