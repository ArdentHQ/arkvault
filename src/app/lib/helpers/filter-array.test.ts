import { describe, expect, it, vi } from "vitest";

import { filterArray } from "./filter-array";

describe("filterArray", () => {
	it("should filter an array based on the iteratee function", () => {
		const array = [1, 2, 3, 4, 5];
		const result = filterArray(array, (item) => item > 3);
		expect(result).toEqual([4, 5]);
	});

	it("should return an empty array if no elements match the condition", () => {
		const array = [1, 2, 3];
		const result = filterArray(array, (item) => item > 5);
		expect(result).toEqual([]);
	});

	it("should return the same array if all elements match the condition", () => {
		const array = [1, 2, 3];
		const result = filterArray(array, (item) => item > 0);
		expect(result).toEqual([1, 2, 3]);
	});

	it("should pass the correct arguments to the iteratee function", () => {
		const array = [10, 20, 30];
		const mockIteratee = vi.fn((item) => item > 15);
		filterArray(array, mockIteratee);

		expect(mockIteratee).toHaveBeenCalledTimes(3);
		expect(mockIteratee).toHaveBeenCalledWith(10, 0, array);
		expect(mockIteratee).toHaveBeenCalledWith(20, 1, array);
		expect(mockIteratee).toHaveBeenCalledWith(30, 2, array);
	});
});
