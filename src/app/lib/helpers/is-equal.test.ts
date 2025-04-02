import { describe } from "@ardenthq/sdk-test";

import { isEqual } from "./is-equal";

describe("isEqual", async ({ assert, it, nock, loader }) => {
	it("should return true for the same strings", () => {
		assert.true(isEqual("true", "true"));
	});

	it("should return true for the same numbers", () => {
		assert.true(isEqual(1, 1));
	});

	it("should return true for the same booleans", () => {
		assert.true(isEqual(true, true));
	});

	it("should return true for the same objects", () => {
		assert.true(isEqual({}, {}));
	});

	it("should return true for the same arrays", () => {
		assert.true(isEqual([], []));
	});

	it("should return true for the same nulls", () => {
		assert.true(isEqual(null, null));
	});
});
