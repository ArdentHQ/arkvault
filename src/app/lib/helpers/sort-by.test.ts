import { describe, expect, it } from "vitest";

import { sortBy } from "./sort-by";

describe("sortBy", () => {
	const dummies = [
		{ age: 30, name: "John" },
		{ age: 40, name: "Jane" },
		{ age: 18, name: "Andrew" },
		{ age: 18, name: "Bob" },
	];

	it("should sort records without iteratees", () => {
		expect(sortBy([...dummies])).toEqual([
			{ age: 30, name: "John" },
			{ age: 40, name: "Jane" },
			{ age: 18, name: "Andrew" },
			{ age: 18, name: "Bob" },
		]);
	});

	it("should sort records by string", () => {
		expect(sortBy([...dummies], "age")).toEqual([
			{ age: 18, name: "Andrew" },
			{ age: 18, name: "Bob" },
			{ age: 30, name: "John" },
			{ age: 40, name: "Jane" },
		]);
	});

	it("should sort records by array", () => {
		expect(sortBy([...dummies], ["age"])).toEqual([
			{ age: 18, name: "Andrew" },
			{ age: 18, name: "Bob" },
			{ age: 30, name: "John" },
			{ age: 40, name: "Jane" },
		]);
	});
});
