import { describe, expect, it } from "vitest";

import { filterObject } from "./filter-object";

describe("filterObject", () => {
	it("should filter object keys based on the predicate", () => {
		const input = { a: 1, b: 2, c: 3 };
		const predicate = (value: number) => value > 1;
		const result = filterObject(input, predicate);
		expect(result).toEqual({ b: 2, c: 3 });
	});

	it("should return an empty object when input is empty", () => {
		const input = {};
		const predicate = () => true;
		const result = filterObject(input, predicate);
		expect(result).toEqual({});
	});

	it("should return an empty object when predicate always returns false", () => {
		const input = { a: 1, b: 2, c: 3 };
		const predicate = () => false;
		const result = filterObject(input, predicate);
		expect(result).toEqual({});
	});

	it("should return the same object when predicate always returns true", () => {
		const input = { a: 1, b: 2, c: 3 };
		const predicate = () => true;
		const result = filterObject(input, predicate);
		expect(result).toEqual(input);
	});
});
