import { has } from "./has";

describe("has", () => {
	it("should return false if the target is not an object", () => {
		expect(has([], "a.b.c")).toBe(false);
	});

	it("should return false if the path is not a string", () => {
		expect(has({}, 123 as any)).toBe(false);
	});

	it("should not do anything if the object is not an object", () => {
		expect(has([], "a.b.c")).toBe(false);
	});

	it("should work like lodash", () => {
		const object = { a: { b: 2 } };

		expect(has(object, "a")).toBe(true);
		expect(has(object, "a.b")).toBe(true);
		expect(has(object, "c")).toBe(false);
		expect(has({ a: undefined }, "a")).toBe(true);
	});

	it("should exit early if it encounters a non-object value", () => {
		const object = { a: { b: 2 } };

		expect(has(object, "a.b.c")).toBe(false);
	});
});
