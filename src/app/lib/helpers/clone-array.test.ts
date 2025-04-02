import { describe } from "@ardenthq/sdk-test";

import { cloneArray } from "./clone-array";

describe("cloneArray", async ({ assert, it, nock, loader }) => {
	it("should work like lodash", () => {
		const objects = [{ a: 1 }, { b: 2 }];

		assert.equal(cloneArray(objects), objects);
	});
});
