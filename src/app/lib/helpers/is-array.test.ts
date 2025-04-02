import { describe, expect, it } from "vitest";

import { isArray } from "./is-array";

describe("isArray", () => {
	it("should pass", () => {
		expect(isArray([1])).toBe(true);
	});

	it("should fail", () => {
		expect(isArray(1)).toBe(false);
	});
});
