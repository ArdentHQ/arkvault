import { describe, expect, it } from "vitest";

import { reduceArray } from "./reduce-array";

describe("reduceArray", () => {
	it("should work with a function", () => {
		expect(reduceArray([1, 2], (sum, n) => sum + n, 0)).toBe(3);
	});
});
