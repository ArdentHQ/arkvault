import { describe, expect, it } from "vitest";

import { isNil } from "./is-nil";

describe("isNil", () => {
	it("should pass", () => {
		expect(isNil(undefined)).toBe(true);
		expect(isNil(null)).toBe(true);
	});

	it("should fail", () => {
		expect(isNil("undefined")).toBe(false);
		expect(isNil("null")).toBe(false);
	});
});
