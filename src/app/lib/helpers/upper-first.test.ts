import { describe, expect, it } from "vitest";

import { upperFirst } from "./upper-first";

describe("upperFirst", () => {
	const dummies = {
		FRED: "FRED",
		fred: "Fred",
		"test space": "Test space",
	};

	it("should capitalize the given input", () => {
		for (const key of Object.keys(dummies)) {
			expect(upperFirst(key)).toBe(dummies[key]);
		}
	});
});
