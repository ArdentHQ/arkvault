import { describe } from "@ardenthq/sdk-test";

import { isObject } from "./is-object";

describe("isObject", async ({ assert, it, nock, loader }) => {
	it("should pass", () => {
		assert.true(isObject({ key: "value" }));
	});

	it("should fail", () => {
		assert.false(isObject(1));
	});
});
