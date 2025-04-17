import { UUID } from "@ardenthq/sdk-cryptography";
import { describe } from "@ardenthq/sdk-test";

import { MemoryStorage } from "./memory.storage";

describe("MemoryStorage", ({ beforeEach, it, assert }) => {
	beforeEach((context) => {
		context.subject = new MemoryStorage();
		context.key = UUID.random();
	});

	it("MemoryStorage#all", async (context) => {
		assert.equal(await context.subject.all(), {});

		await context.subject.set(context.key, "value");

		assert.equal(await context.subject.all(), { [context.key]: "value" });

		await context.subject.flush();

		assert.equal(await context.subject.all(), {});
	});

	it("MemoryStorage#get", async (context) => {
		await context.subject.set(context.key, "value");

		assert.is(await context.subject.get(context.key), "value");
	});

	it("MemoryStorage#set", async (context) => {
		assert.undefined(await context.subject.set(context.key, "value"));
	});

	it("MemoryStorage#has", async (context) => {
		assert.is(await context.subject.has(context.key), false);

		await context.subject.set(context.key, "value");

		assert.true(await context.subject.has(context.key));
	});

	it("MemoryStorage#forget", async (context) => {
		assert.is(await context.subject.has(context.key), false);

		await context.subject.set(context.key, "value");

		assert.true(await context.subject.has(context.key));

		await context.subject.forget(context.key);

		assert.is(await context.subject.has(context.key), false);
	});

	it("MemoryStorage#flush", async (context) => {
		assert.is(await context.subject.has(context.key), false);

		await context.subject.set(context.key, "value");

		assert.true(await context.subject.has(context.key));

		await context.subject.flush();

		assert.is(await context.subject.has(context.key), false);
	});

	it("MemoryStorage#count", async (context) => {
		assert.is(await context.subject.count(), 0);

		await context.subject.set(context.key, "value");

		assert.is(await context.subject.count(), 1);

		await context.subject.forget(context.key);

		assert.is(await context.subject.count(), 0);
	});

	it("MemoryStorage#snapshot", async (context) => {
		assert.undefined(await context.subject.snapshot());
	});

	it("MemoryStorage#restore", async (context) => {
		assert.undefined(await context.subject.restore());
	});
});
