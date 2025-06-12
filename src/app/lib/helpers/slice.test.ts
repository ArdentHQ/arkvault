import { describe, expect, it } from "vitest";

import { slice } from "./slice";

describe("slice", () => {
	const array = [1, 2, 3, 4, 5];

	it("should slice a portion of the array", () => {
		expect(slice(array, 1, 4)).toEqual([2, 3, 4]);
	});

	it("should work with a negative start index", () => {
		expect(slice(array, -2, 5)).toEqual([4, 5]);
	});

	it("should work with a negative end index", () => {
		expect(slice(array, 0, -1)).toEqual([1, 2, 3, 4]);
	});

	it("should handle start index greater than end index", () => {
		expect(slice(array, 3, 2)).toEqual([]);
	});

	it("should handle end index greater than array length", () => {
		expect(slice(array, 1, 10)).toEqual([2, 3, 4, 5]);
	});

	it("should handle start index less than negative array length", () => {
		expect(slice(array, -10, 5)).toEqual([1, 2, 3, 4, 5]);
	});

	it("should handle negative start and end indices", () => {
		expect(slice(array, -3, -1)).toEqual([3, 4]);
	});

	it("should return an empty array for an empty input array", () => {
		expect(slice([], 0, 1)).toEqual([]);
	});
});
