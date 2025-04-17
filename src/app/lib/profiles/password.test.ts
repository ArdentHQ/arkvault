import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { PasswordManager } from "./password";

describe("PasswordManager", ({ it, assert, beforeEach }) => {
	beforeEach((context) => {
		bootContainer();

		context.subject = new PasswordManager();
	});

	it("should set and get password", (context) => {
		assert.throws(() => context.subject.get(), "Failed to find a password for the given profile.");

		context.subject.set("password");

		assert.is(context.subject.get(), "password");
	});

	it("#exists", (context) => {
		assert.throws(() => context.subject.get(), "Failed to find a password for the given profile.");

		assert.false(context.subject.exists());
		context.subject.set("password");

		assert.true(context.subject.exists());
	});

	it("#forget", (context) => {
		assert.throws(() => context.subject.get(), "Failed to find a password for the given profile.");

		context.subject.set("password");
		assert.true(context.subject.exists());
		context.subject.forget();

		assert.false(context.subject.exists());
	});
});
