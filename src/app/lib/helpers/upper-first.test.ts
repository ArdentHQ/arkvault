import { describe, expect, it } from "vitest";

import { upperFirst } from "./upper-first";

describe("upperFirst", () => {
	const dummies = {
		fred: "Fred",
		FRED: "FRED",
		"test space": "Test space",
	};

	it("should capitalize the given input", () => {
		Object.keys(dummies).forEach((key) => {
			expect(upperFirst(key)).toBe(dummies[key]);
		});
	});
});
