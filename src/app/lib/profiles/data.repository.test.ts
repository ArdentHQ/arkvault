import { describe } from "@ardenthq/sdk-test";

import { DataRepository } from "./data.repository";

describe("DataRepository", ({ it, assert, beforeEach }) => {
	beforeEach((context) => (context.subject = new DataRepository()));

	it("#all", (context) => {
		context.subject.set("key1", "value1");
		context.subject.set("key2", "value2");

		assert.equal(context.subject.all(), {
			key1: "value1",
			key2: "value2",
		});
	});

	it("#first", (context) => {
		context.subject.set("key1", "value1");
		context.subject.set("key2", "value2");

		assert.is(context.subject.first(), "value1");
	});

	it("#last", (context) => {
		context.subject.set("key1", "value1");
		context.subject.set("key2", "value2");

		assert.is(context.subject.last(), "value2");
	});

	it("#keys", (context) => {
		context.subject.set("key1", "value1");
		context.subject.set("key2", "value2");

		assert.equal(context.subject.keys(), ["key1", "key2"]);
	});

	it("#values", (context) => {
		context.subject.set("key1", "value1");
		context.subject.set("key2", "value2");

		assert.equal(context.subject.values(), ["value1", "value2"]);
	});

	it("#get | #set | #has | #missing", (context) => {
		assert.undefined(context.subject.get("key"));
		assert.false(context.subject.has("key"));
		assert.true(context.subject.missing("key"));

		context.subject.set("key", "value");

		assert.is(context.subject.get("key"), "value");
		assert.true(context.subject.has("key"));
		assert.false(context.subject.missing("key"));
	});

	it("#fill", (context) => {
		context.subject.set("key", "value");

		assert.is(context.subject.get("key"), "value");
		assert.true(context.subject.has("key"));
		assert.false(context.subject.missing("key"));

		context.subject.flush();

		assert.undefined(context.subject.get("key"));
		assert.false(context.subject.has("key"));
		assert.true(context.subject.missing("key"));
	});

	it("#forget", (context) => {
		context.subject.set("key", "value");

		assert.is(context.subject.get("key"), "value");
		assert.true(context.subject.has("key"));
		assert.false(context.subject.missing("key"));

		context.subject.forget("key");

		assert.undefined(context.subject.get("key"));
		assert.false(context.subject.has("key"));
		assert.true(context.subject.missing("key"));
	});

	it("#forgetIndex", (context) => {
		context.subject.set("key", [1, 2, 3]);

		assert.equal(context.subject.get("key"), [1, 2, 3]);

		context.subject.forgetIndex("key", 1);

		assert.equal(context.subject.get("key"), [1, 3]);

		context.subject.forgetIndex("key", 10);

		assert.equal(context.subject.get("key"), [1, 3]);

		context.subject.forgetIndex("xkey", 10);

		assert.undefined(context.subject.get("xkey"));
	});

	it("#flush", (context) => {
		context.subject.set("key", "value");

		assert.is(context.subject.get("key"), "value");
		assert.true(context.subject.has("key"));
		assert.false(context.subject.missing("key"));

		context.subject.flush();

		assert.undefined(context.subject.get("key"));
		assert.false(context.subject.has("key"));
		assert.true(context.subject.missing("key"));
	});

	it("#count", (context) => {
		context.subject.set("key", "value");

		assert.is(context.subject.count(), 1);

		context.subject.flush();

		assert.is(context.subject.count(), 0);
	});

	it("#snapshot | #restore", (context) => {
		context.subject.set("key", "value");

		assert.is(context.subject.count(), 1);

		context.subject.snapshot();
		context.subject.flush();

		assert.is(context.subject.count(), 0);

		context.subject.restore();

		assert.is(context.subject.count(), 1);

		assert.throws(() => context.subject.restore(), "There is no snapshot to restore.");
	});

	it("#toJSON", (context) => {
		context.subject.set("key", "value");

		assert.string(context.subject.toJSON());
	});
});
