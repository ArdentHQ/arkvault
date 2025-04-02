import { describe } from "@ardenthq/sdk-test";

import { indexOf } from "./index-of";

describe("indexOf", async ({ assert, it, nock, loader }) => {
	it("should return the expected index", () => {
		assert.is(indexOf([1, 2, 1, 2], 2), 1);
		assert.is(indexOf([1, 2, 1, 2], 2, 3), 3);
		assert.is(indexOf([1, 2, 1, 2], 2, 2), 3);
		assert.is(indexOf([1, 2, 1, 2], 3), -1);
		assert.is(indexOf([], 0, -1), -1);
	});
});
