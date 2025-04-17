import { describe } from "@ardenthq/sdk-test";

import { Cache } from "./cache.service.js";

describe("Cache", async ({ beforeEach, it, assert }) => {
	beforeEach((context) => (context.subject = new Cache("wallet-ABC")));

	it("should return a list of all key-value pairs", async (context) => {
		assert.empty(context.subject.all());

		context.subject.set("key", "value", 1);

		assert.not.empty(context.subject.all());
	});

	it("should return a list of all keys", async (context) => {
		assert.empty(context.subject.keys());

		context.subject.set("key", "value", 1);

		assert.not.empty(context.subject.keys());
		assert.string(context.subject.keys()[0]);
	});

	it("should set, get and forget a value", async (context) => {
		assert.throws(() => context.subject.get("key"));
		assert.false(context.subject.has("key"));

		context.subject.set("key", "value", 1);

		assert.is(context.subject.get("key"), "value");
		assert.true(context.subject.has("key"));

		context.subject.forget("key");

		assert.throws(() => context.subject.get("key"));
		assert.false(context.subject.has("key"));
	});

	it("should flush the cache", async (context) => {
		assert.throws(() => context.subject.get("key"));
		assert.false(context.subject.has("key"));

		context.subject.set("key", "value", 1);

		assert.is(context.subject.get("key"), "value");
		assert.true(context.subject.has("key"));

		context.subject.flush();

		assert.throws(() => context.subject.get("key"));
		assert.false(context.subject.has("key"));
	});
});
