import { describe } from "@ardenthq/sdk-test";

import { isNil } from "./is-nil";

describe("isNil", async ({ assert, it, nock, loader }) => {
	it("should pass", () => {
		assert.true(isNil(undefined));
		assert.true(isNil(null));
	});

	it("should fail", () => {
		assert.false(isNil("undefined"));
		assert.false(isNil("null"));
	});
});
