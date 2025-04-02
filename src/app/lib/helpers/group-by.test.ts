import { describe } from "@ardenthq/sdk-test";

import { groupBy } from "./group-by";

describe("groupBy", async ({ assert, it, nock, loader }) => {
	it("should work with a function", () => {
		assert.equal(
			groupBy(
				[
					{ first: "John", last: "Doe" },
					{ first: "Jane", last: "Doe" },
					{ first: "John", last: "Dorian" },
				],
				(o) => o.last,
			),
			{
				Doe: [
					{ first: "John", last: "Doe" },
					{ first: "Jane", last: "Doe" },
				],
				Dorian: [{ first: "John", last: "Dorian" }],
			},
		);
	});

	it("should with a native function", () => {
		assert.equal(groupBy([6.1, 4.2, 6.3], Math.floor), { 4: [4.2], 6: [6.1, 6.3] });
	});
});
