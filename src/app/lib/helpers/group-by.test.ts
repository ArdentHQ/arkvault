import { describe, expect, it } from "vitest";

import { groupBy } from "./group-by";

describe("groupBy", () => {
	it("should work with a function", () => {
		expect(
			groupBy(
				[
					{ first: "John", last: "Doe" },
					{ first: "Jane", last: "Doe" },
					{ first: "John", last: "Dorian" },
				],
				(o) => o.last,
			),
		).toEqual({
			Doe: [
				{ first: "John", last: "Doe" },
				{ first: "Jane", last: "Doe" },
			],
			Dorian: [{ first: "John", last: "Dorian" }],
		});
	});

	it("should work with a native function", () => {
		expect(groupBy([6.1, 4.2, 6.3], Math.floor)).toEqual({
			4: [4.2],
			6: [6.1, 6.3],
		});
	});
});
