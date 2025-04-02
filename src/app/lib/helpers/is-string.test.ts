import { describe, expect, it } from "vitest";

import { isString } from "./is-string";

describe("isString", () => {
	it("should pass", () => {
		expect(isString("string")).toBe(true);
	});

	it("should fail", () => {
		expect(isString(1)).toBe(false);
	});
});
