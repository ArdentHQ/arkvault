import { describe, expect, it } from "vitest";

import { createNewSortInstance, inPlaceSort, sort } from "./fast-sort";

const unsorted = [3, 1, 4, 1, 5, 9, 2, 6];
const sortedAsc = [1, 1, 2, 3, 4, 5, 6, 9];
const sortedDesc = [9, 6, 5, 4, 3, 2, 1, 1];

const users = [
	{ name: "John", age: 30, score: 80 },
	{ name: "Jane", age: 25, score: 90 },
	{ name: "Doe", age: 30, score: 70 },
	{ name: "Alice", age: 25, score: 90 },
];

describe("sort", () => {
	it("should not sort in place by default", () => {
		const arr = [...unsorted];
		sort(arr).asc();
		expect(arr).toEqual(unsorted);
	});

	describe("asc", () => {
		it("should sort a flat array of numbers in ascending order", () => {
			expect(sort(unsorted).asc()).toEqual(sortedAsc);
		});

		it("should work with sortBy being true", () => {
			expect(sort(unsorted).asc(true as any)).toEqual(sortedAsc);
		});

		it("should sort an array of objects by a string property", () => {
			const sortedByAge = sort(users).asc("age");
			expect(sortedByAge.map((u) => u.age)).toEqual([25, 25, 30, 30]);
		});

		it("should sort an array of objects by a function property", () => {
			const sortedByScore = sort(users).asc((u) => u.score);
			expect(sortedByScore.map((u) => u.score)).toEqual([70, 80, 90, 90]);
		});

		it("should sort by multiple properties (string array)", () => {
			const users2 = [
				{ name: "C", age: 30, score: 80 },
				{ name: "B", age: 25, score: 90 },
				{ name: "A", age: 30, score: 70 },
			];
			const sorted2 = sort(users2).asc(["age", "score"]);
			expect(sorted2.map((u) => u.name)).toEqual(["B", "A", "C"]);
		});

		it("should sort by multiple properties (function array)", () => {
			const users2 = [
				{ name: "C", age: 30, score: 80 },
				{ name: "B", age: 25, score: 90 },
				{ name: "A", age: 30, score: 70 },
			];
			const sorted = sort(users2).asc([(u) => u.age, (u) => u.score]);
			expect(sorted.map((u) => u.name)).toEqual(["B", "A", "C"]);
		});

		it("should sort by multiple properties (mixed string/function array)", () => {
			const users2 = [
				{ name: "C", age: 30, score: 80 },
				{ name: "B", age: 25, score: 90 },
				{ name: "A", age: 30, score: 70 },
			];
			const sorted = sort(users2).asc(["age", (u) => u.score]);
			expect(sorted.map((u) => u.name)).toEqual(["B", "A", "C"]);
		});

		it("should handle null values", () => {
			const arr = [1, null, 3, undefined, 2]; // undefined is treated as null by `== null`
			const sortedArr = sort(arr).asc();
			expect(sortedArr).toEqual([1, 2, 3, null, undefined]); // nulls are pushed to the end
		});
	});

	describe("desc", () => {
		it("should sort a flat array of numbers in descending order", () => {
			expect(sort(unsorted).desc()).toEqual(sortedDesc);
		});

		it("should work with sortBy being true", () => {
			expect(sort(unsorted).desc(true as any)).toEqual(sortedDesc);
		});

		it("should sort an array of objects by a string property in descending order", () => {
			const sortedByAge = sort(users).desc("age");
			expect(sortedByAge.map((u) => u.age)).toEqual([30, 30, 25, 25]);
		});

		it("should sort by multiple properties descending", () => {
			const users2 = [
				{ name: "C", age: 30, score: 80 },
				{ name: "B", age: 25, score: 90 },
				{ name: "A", age: 30, score: 70 },
			];
			const sorted = sort(users2).desc(["age", "score"]);
			expect(sorted.map((u) => u.name)).toEqual(["C", "A", "B"]); // age desc, then score desc
		});

		it("should handle null values", () => {
			const arr = [1, null, 3, undefined, 2];
			const sortedArr = sort(arr).desc();
			expect(sortedArr).toEqual([3, 2, 1, null, undefined]);
		});
	});

	describe("by", () => {
		it("should sort by multiple properties with mixed order", () => {
			const users2 = [
				{ name: "C", age: 30, score: 80 },
				{ name: "B", age: 25, score: 90 },
				{ name: "A", age: 30, score: 70 },
			];
			const sorted = sort(users2).by([{ asc: "age" }, { desc: "score" }]);
			expect(sorted.map((u) => u.name)).toEqual(["B", "C", "A"]);
		});

		it("should sort with function sorters", () => {
			const users2 = [
				{ name: "C", age: 30, score: 80 },
				{ name: "B", age: 25, score: 90 },
				{ name: "A", age: 30, score: 70 },
			];
			const sorted = sort(users2).by([{ asc: (u) => u.age }, { desc: (u) => u.score }]);
			expect(sorted.map((u) => u.name)).toEqual(["B", "C", "A"]);
		});

		it("should handle a single object sorter", () => {
			const sorted = sort(users).by({ asc: "age" });
			expect(sorted.map((u) => u.age)).toEqual([25, 25, 30, 30]);
		});

		it("should sort by multiple properties with a comparer", () => {
			const customComparer = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
			const sorted = sort(users).by([{ asc: "age" }, { desc: "score", comparer: customComparer }]);
			const johnIndex = sorted.findIndex((u) => u.name === "John");
			const doeIndex = sorted.findIndex((u) => u.name === "Doe");
			expect(johnIndex).toBeLessThan(doeIndex);
		});
	});

	describe("Error handling", () => {
		it("should throw error for nested properties in string syntax", () => {
			expect(() => sort(users).asc("profile.age" as any)).toThrow(
				"String syntax not allowed for nested properties.",
			);
		});

		it("should throw error for ambiguous object sorter", () => {
			expect(() => sort(users).by({ asc: "age", desc: "score" } as any)).toThrow(
				"Ambiguous object with `asc` and `desc` config properties",
			);
		});

		it("should throw error for invalid object sorter", () => {
			expect(() => sort(users).by({} as any)).toThrow("Expected `asc` or `desc` property");
		});

		it("should throw error for null sorter object", () => {
			expect(() => sort(users).by(null as any)).toThrow("Expected `asc` or `desc` property");
		});
	});

	describe("Custom Comparer", () => {
		it("should use custom comparer with asc", () => {
			const customComparer = (a, b) => {
				const lenA = a ? a.length : 0;
				const lenB = b ? b.length : 0;
				if (lenA < lenB) return -1;
				if (lenA > lenB) return 1;
				return 0;
			};

			const sorter = createNewSortInstance({ comparer: customComparer });
			const strArr = ["apple", "banana", "kiwi", "pear"]; // 5, 6, 4, 4

			const sortedAsc = sorter(strArr).asc();
			expect(sortedAsc).toEqual(["kiwi", "pear", "apple", "banana"]);
		});

		it("should use custom comparer with object sorter", () => {
			const customComparer = (a, b) => String(a).localeCompare(String(b));
			const data = [{ val: "c" }, { val: "b" }, { val: "a" }];
			const sortedData = sort(data).by({ asc: "val", comparer: customComparer });
			expect(sortedData.map((d) => d.val)).toEqual(["a", "b", "c"]);
		});
	});

	it("should handle empty array", () => {
		expect(sort([]).asc()).toEqual([]);
		expect(sort([]).desc()).toEqual([]);
		expect(sort([]).by({ asc: "a" })).toEqual([]);
	});

	it("should handle non-array input", () => {
		const input: any = { a: 1 };
		expect(sort(input).asc()).toBe(input);
	});

	it("should unpack single sortBy from array", () => {
		const sorted = sort(users).asc(["age"]);
		expect(sorted.map((u) => u.age)).toEqual([25, 25, 30, 30]);
	});
});

describe("inPlaceSort", () => {
	it("should sort in place", () => {
		const arr = [...unsorted];
		inPlaceSort(arr).asc();
		expect(arr).toEqual(sortedAsc);
	});

	it("should sort in place with desc", () => {
		const arr = [...unsorted];
		inPlaceSort(arr).desc();
		expect(arr).toEqual(sortedDesc);
	});

	it("should sort in place with by", () => {
		const users2 = [
			{ name: "C", age: 30, score: 80 },
			{ name: "B", age: 25, score: 90 },
			{ name: "A", age: 30, score: 70 },
		];
		const expected = [
			{ name: "B", age: 25, score: 90 },
			{ name: "C", age: 30, score: 80 },
			{ name: "A", age: 30, score: 70 },
		];
		inPlaceSort(users2).by([{ asc: (u) => u.age }, { desc: (u) => u.score }]);
		expect(users2).toEqual(expected);
	});

	it("should handle non-array input", () => {
		const input: any = { a: 1 };
		expect(inPlaceSort(input).asc()).toBe(input);
	});
});

describe("multiPropertySorter with nulls", () => {
	it("should handle null values correctly in multi-property sort", () => {
		const data = [
			{ a: 1, b: 3 },
			{ a: null, b: 1 },
			{ a: 1, b: 2 },
			{ a: null, b: 4 },
		];

		const sorted = sort(data).asc(["a", "b"]);
		expect(sorted).toEqual([
			{ a: 1, b: 2 },
			{ a: 1, b: 3 },
			{ a: null, b: 1 },
			{ a: null, b: 4 },
		]);
	});

	it("should handle equal null values in multi-property sort", () => {
		const data = [
			{ a: 1, b: 3 },
			{ a: 1, b: null },
			{ a: 1, b: 2 },
			{ a: 1, b: null },
		];

		const sorted = sort(data).asc(["a", "b"]);

		expect(sorted).toEqual([
			{ a: 1, b: 2 },
			{ a: 1, b: 3 },
			{ a: 1, b: null },
			{ a: 1, b: null },
		]);
	});
});
