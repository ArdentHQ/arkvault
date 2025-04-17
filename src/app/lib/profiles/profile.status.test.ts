import { Base64 } from "@ardenthq/sdk-cryptography";
import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { Profile } from "./profile";

describe("Profile status", ({ it, assert, beforeEach }) => {
	beforeEach(async (context) => {
		bootContainer();

		context.profile = new Profile({ avatar: "avatar", data: Base64.encode("{}"), id: "id", name: "name" });
	});

	it("should mark the profile as dirty", async (context) => {
		assert.false(context.profile.status().isDirty());
		context.profile.status().markAsDirty();
		assert.true(context.profile.status().isDirty());
	});

	it("should mark the profile as restored", async (context) => {
		assert.false(context.profile.status().isRestored());
		context.profile.status().markAsRestored();
		assert.true(context.profile.status().isRestored());
	});

	it("should reset the status of the profile to the default values", async (context) => {
		context.profile.status().markAsRestored();
		assert.true(context.profile.status().isRestored());
		context.profile.status().reset();
		assert.false(context.profile.status().isRestored());
	});

	it("should reset dirty status", async (context) => {
		context.profile.status().markAsDirty();
		assert.true(context.profile.status().isDirty());
		context.profile.status().markAsClean();
		assert.false(context.profile.status().isDirty());
	});
});
