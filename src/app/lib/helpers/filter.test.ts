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
			a: { value: 1, active: true },
			b: { value: 2, active: false },
			c: { value: 3, active: true },
		};
		const result = filter(object, (item: { active: boolean }) => item.active);
		expect(result).toEqual({
			a: { value: 1, active: true },
			c: { value: 3, active: true },
		});
	});

	it("should pass (value, index, array) to the iteratee for arrays", () => {
		const array = ["a", "b"];
		const args: any[] = [];
		filter(array, (...rest) => {
			args.push(rest);
			return true;
		});

		expect(args).toEqual([
			["a", 0, array],
			["b", 1, array],
		]);
	});

	it("should pass (value, key, object) to the iteratee for objects", () => {
		const object = { a: 1, b: 2 };
		const args: any[] = [];
		filter(object, (...rest) => {
			args.push(rest);
			return true;
		});

		expect(args).toEqual([
			[1, "a", object],
			[2, "b", object],
		]);
	});
});
