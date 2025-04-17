import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { Authenticator } from "./authenticator";
import { ProfileSetting } from "./contracts";
import { Profile } from "./profile";
import { ProfileExporter } from "./profile.exporter";

describe("Authenticator", async ({ it, assert, beforeEach }) => {
	beforeEach((context) => {
		bootContainer();

		context.profile = new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" });
		context.subject = new Authenticator(context.profile);
	});

	it("should set the password", async (context) => {
		assert.undefined(context.profile.settings().get(ProfileSetting.Password));

		assert.undefined(context.subject.setPassword("password"));

		assert.string(context.profile.settings().get(ProfileSetting.Password));
	});

	it("should verify the password", async (context) => {
		context.subject.setPassword("password");

		assert.true(context.subject.verifyPassword("password"));
		assert.false(context.subject.verifyPassword("invalid"));
	});

	it("should fail to verify the password for a profile that doesn't use a profile", async (context) => {
		assert.throws(() => context.subject.verifyPassword("password"), "No password is set.");
	});

	it("should change the password", (context) => {
		context.subject.setPassword("old-password");

		const oldPassword = context.profile.settings().get(ProfileSetting.Password);

		assert.undefined(context.subject.changePassword("old-password", "new-password"));

		assert.is.not(context.profile.settings().get(ProfileSetting.Password), oldPassword);
	});

	it("should fail to change the password if no password is set", (context) => {
		assert.throws(() => context.subject.changePassword("old-password", "new-password"), "No password");
	});

	it("should fail to change the password if the old password is invalid", (context) => {
		context.subject.setPassword("old-password");

		assert.throws(() => context.subject.changePassword("invalid-old-password", "new-password"), "does not match");
	});

	it("should set password in memory", (context) => {
		context.subject.setPassword("password");

		assert.is(context.profile.password().get(), "password");
	});

	it("should forget the password", async (context) => {
		assert.false(context.profile.usesPassword());
		const firstExport = await new ProfileExporter(context.profile).export();
		assert.string(firstExport);

		context.subject.setPassword("old-password");

		assert.true(context.profile.usesPassword());
		assert.true((await new ProfileExporter(context.profile).export()).length > firstExport.length * 2);

		context.subject.forgetPassword("old-password");

		assert.false(context.profile.usesPassword());
		assert.true((await new ProfileExporter(context.profile).export()).length <= firstExport.length);
	});

	it("should fail to forget the password if the current password is invalid", (context) => {
		context.subject.setPassword("password");

		assert.throws(() => context.subject.forgetPassword("invalid-password"), "does not match");
	});
});
