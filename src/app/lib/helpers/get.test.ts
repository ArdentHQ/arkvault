import { get } from "./get";

describe("get", () => {
	it("should return the default value if the target is not an object", () => {
		expect(get([], "a.b.c", "defaultValue")).toBe("defaultValue");
	});

	it("should return the default value if the path is not a string", () => {
		expect(get({}, 123 as any, "defaultValue")).toBe("defaultValue");
	});

	it("should not do anything if the object is not an object", () => {
		expect(get([], "a.b.c")).toBeUndefined();
	});

	it("should work with nested objects", () => {
		const object = { a: { b: { c: 3 } } };

		expect(get(object, "a.b.c")).toBe(3);
		expect(get(object, "a.b.c.d", "default")).toBe("default");
	});

	it("should exit early if it encounters an undefined value", () => {
		expect(get({ a: undefined }, "a.b")).toBeUndefined();
		expect(get({ a: null }, "a.b")).toBeUndefined();
	});
});
