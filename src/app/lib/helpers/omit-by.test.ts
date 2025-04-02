import { describe } from "@ardenthq/sdk-test";

import { isNumber } from "./is-number";
import { omitBy } from "./omit-by";

describe("omitBy", async ({ assert, it, nock, loader }) => {
	it("should work with a function", () => {
		assert.equal(omitBy({ a: 1, b: "2", c: 3 }, isNumber), { b: "2" });
	});
});
