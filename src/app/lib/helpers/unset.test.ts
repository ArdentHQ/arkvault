import { describe, it, expect } from "vitest";
import { unset } from "./unset";

describe("unset", () => {
	it("should return false if the target is not an object", () => {
		expect(unset([], "a.b.c")).toBe(false);
	});

	it("should not do anything if the object is not an object", () => {
		expect(unset([], "a.b.c")).toBe(false);
	});

	it("should return false if the path is not a string", () => {
		// @ts-expect-error
		expect(unset({}, 123)).toBe(false);
	});

	it("should work with a string path", () => {
		const object = { a: { b: { c: 7 } } };

		unset(object, "a.b.c");
		expect(object).toEqual({ a: { b: {} } });

		unset(object, "a.b.c");
		expect(object).toEqual({ a: { b: {} } });
	});
});
