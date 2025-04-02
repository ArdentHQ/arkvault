import { describe, expect, it } from "vitest";

import { isLessThanOrEqual } from "./is-less-than-or-equal";

describe("isLessThanOrEqual", () => {
	it("should pass", () => {
		expect(isLessThanOrEqual(1, 2)).toBe(true);
		expect(isLessThanOrEqual(1, 1)).toBe(true);
	});

	it("should fail", () => {
		expect(isLessThanOrEqual(10, 5)).toBe(false);
	});
});
