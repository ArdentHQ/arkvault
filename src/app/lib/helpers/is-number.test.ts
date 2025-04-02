import { describe, expect, it } from "vitest";

import { isNumber } from "./is-number";

describe("isNumber", () => {
	it("should pass", () => {
		expect(isNumber(1)).toBe(true);
	});

	it("should fail", () => {
		expect(isNumber("1")).toBe(false);
	});
});
