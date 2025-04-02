import { describe } from "@ardenthq/sdk-test";

import { reduceArray } from "./reduce-array";

describe("reduceArray", async ({ assert, it, nock, loader }) => {
	it("should work with a function", () => {
		assert.is(
			reduceArray([1, 2], (sum, n) => sum + n, 0),
			3,
		);
	});
});
