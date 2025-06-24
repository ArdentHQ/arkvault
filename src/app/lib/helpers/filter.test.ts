import { describe, expect, it } from "vitest";

import { filter } from "./filter";

describe("filter", () => {
	it("should filter an array based on the predicate", () => {
		const array = [
			{ a: 1, active: true },
			{ a: 2, active: false },
			{ a: 3, active: true },
		];
		const result = filter(array, (item: { active: boolean }) => item.active);
		expect(result).toEqual([
			{ a: 1, active: true },
			{ a: 3, active: true },
		]);
	});

	it("should filter an object based on the predicate", () => {
		const object = {
			a: { active: true, value: 1 },
			b: { active: false, value: 2 },
			c: { active: true, value: 3 },
		};
		const result = filter(object, (item: { active: boolean }) => item.active);
		expect(result).toEqual({
			a: { active: true, value: 1 },
			c: { active: true, value: 3 },
		});
	});

	it("should pass (value, index, array) to the iteratee for arrays", () => {
		const array = ["a", "b"];
		const arguments_: any[] = [];
		filter(array, (...rest) => {
			arguments_.push(rest);
			return true;
		});

		expect(arguments_).toEqual([
			["a", 0, array],
			["b", 1, array],
		]);
	});

	it("should pass (value, key, object) to the iteratee for objects", () => {
		const object = { a: 1, b: 2 };
		const arguments_: any[] = [];
		filter(object, (...rest) => {
			arguments_.push(rest);
			return true;
		});

		expect(arguments_).toEqual([
			[1, "a", object],
			[2, "b", object],
		]);
	});
});
