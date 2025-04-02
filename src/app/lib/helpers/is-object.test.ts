import { describe, expect, it } from "vitest";

import { isObject } from "./is-object";

describe("isObject", () => {
	it("should pass", () => {
		expect(isObject({ key: "value" })).toBe(true);
	});

	it("should fail", () => {
		expect(isObject(1)).toBe(false);
	});
});
