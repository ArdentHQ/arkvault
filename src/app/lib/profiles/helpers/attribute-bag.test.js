import { describeWithContext } from "@ardenthq/sdk-test";

import { AttributeBag } from "./attribute-bag";

describeWithContext("AttributeBag", { values: { a: "a", b: "b", c: "c" } }, ({ beforeEach, it, assert }) => {
	beforeEach((context) => (context.subject = new AttributeBag()));

	it("#all", async (context) => {
		context.subject.setMany(context.values);

		assert.equal(context.subject.all(), context.values);
	});

	it("#get", async (context) => {
		assert.is(context.subject.get("a", "defaultValue"), "defaultValue");

		context.subject.set("a", "a");

		assert.is(context.subject.get("a"), "a");
	});

	it("#set", async (context) => {
		context.subject.set("a", "a");

		assert.true(context.subject.has("a"));
	});

	it("#has", async (context) => {
		assert.false(context.subject.has("a"));

		context.subject.set("a", "a");

		assert.true(context.subject.has("a"));
	});

	it("#hasStrict", async (context) => {
		context.subject.set("a", undefined);

		assert.false(context.subject.hasStrict("a"));

		context.subject.set("a", "a");

		assert.true(context.subject.hasStrict("a"));
	});

	it("#missing", async (context) => {
		assert.true(context.subject.missing("a"));

		context.subject.set("a", "a");

		assert.false(context.subject.missing("a"));
	});

	it("#forget", async (context) => {
		context.subject.set("a", "a");

		assert.true(context.subject.has("a"));

		context.subject.forget("a");

		assert.true(context.subject.missing("a"));
	});

	it("#flush", async (context) => {
		context.subject.set("a", "a");

		assert.true(context.subject.has("a"));

		context.subject.flush();

		assert.true(context.subject.missing("a"));
	});

	it("#only", async (context) => {
		context.subject.setMany(context.values);

		assert.equal(context.subject.only(["a", "b"]), { a: "a", b: "b" });
	});

	it("#except", async (context) => {
		context.subject.setMany(context.values);

		assert.equal(context.subject.except(["a", "b"]), { c: "c" });
	});
});
