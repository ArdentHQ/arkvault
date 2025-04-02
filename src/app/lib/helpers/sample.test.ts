import { describe } from "@ardenthq/sdk-test";

import { sample } from "./sample";

describe("sample", async ({ assert, it, nock, loader }) => {
	it("should return a random item", () => {
		assert.number(sample([1, 2, 3, 4, 5]));
	});
});
