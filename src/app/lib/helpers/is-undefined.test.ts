import { describe, expect, it } from "vitest";

import { isUndefined } from "./is-undefined";

describe("isUndefined", () => {
	it("should pass", () => {
		expect(isUndefined(undefined)).toBe(true);
	});

	it("should fail", () => {
		expect(isUndefined("undefined")).toBe(false);
	});
});
