import { describe, expect, it } from "vitest";

import { isEqual } from "./is-equal";

describe("isEqual", () => {
	it("should return true for the same strings", () => {
		expect(isEqual("true", "true")).toBe(true);
	});

	it("should return true for the same numbers", () => {
		expect(isEqual(1, 1)).toBe(true);
	});

	it("should return true for the same booleans", () => {
		expect(isEqual(true, true)).toBe(true);
	});

	it("should return true for the same objects", () => {
		expect(isEqual({}, {})).toBe(true);
	});

	it("should return true for the same arrays", () => {
		expect(isEqual([], [])).toBe(true);
	});

	it("should return true for the same nulls", () => {
		expect(isEqual(null, null)).toBe(true);
	});
});
