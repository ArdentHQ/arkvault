import { describe } from "@ardenthq/sdk-test";

import { get } from "./get";

describe("get", async ({ assert, it, nock, loader }) => {
	it("should return the default value if the target is not an object", () => {
		assert.is(get([], "a.b.c", "defaultValue"), "defaultValue");
	});

	it("should return the default value if the path is not a string", () => {
		assert.is(get({}, 123, "defaultValue"), "defaultValue");
	});

	it("should not do anything if the object is not an object", () => {
		assert.undefined(get([], "a.b.c"));
	});

	it("should work with nested objects", () => {
		const object = { a: { b: { c: 3 } } };

		assert.is(get(object, "a.b.c"), 3);
		assert.is(get(object, "a.b.c.d", "default"), "default");
	});

	it("should exit early if it encounters an undefined value", () => {
		assert.undefined(get({ a: undefined }, "a.b"));
		assert.undefined(get({ a: null }, "a.b"));
	});
});
