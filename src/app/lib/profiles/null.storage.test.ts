import { describe } from "@ardenthq/sdk-test";

import { NullStorage } from "./null.storage";

describe("NullStorage", ({ it, assert, beforeEach }) => {
	beforeEach((context) => (context.subject = new NullStorage()));

	it("#all", async (context) => {
		assert.equal(await context.subject.all(), {});
	});

	it("#get", async (context) => {
		assert.undefined(await context.subject.get("key"));
	});

	it("#set", async (context) => {
		assert.undefined(await context.subject.set("key", "value"));
	});

	it("#has", async (context) => {
		assert.false(await context.subject.has("key"));
	});

	it("#forget", async (context) => {
		assert.undefined(await context.subject.forget("null"));
	});

	it("#flush", async (context) => {
		assert.undefined(await context.subject.flush());
	});

	it("#count", async (context) => {
		assert.is(await context.subject.count(), 0);
	});

	it("#snapshot", async (context) => {
		assert.undefined(await context.subject.snapshot());
	});

	it("#restore", async (context) => {
		assert.undefined(await context.subject.restore());
	});
});
