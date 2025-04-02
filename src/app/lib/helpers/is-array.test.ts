import { describe } from "@ardenthq/sdk-test";

import { isArray } from "./is-array";

describe("isArray", async ({ assert, it, nock, loader }) => {
	it("should pass", () => {
		assert.true(isArray([1]));
	});

	it("should fail", () => {
		assert.false(isArray(1));
	});
});
