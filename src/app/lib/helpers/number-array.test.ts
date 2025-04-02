import { describe, expect, it } from "vitest";

import { numberArray } from "./number-array";

describe("numberArray", () => {
	it("should contain 5 numbers starting from 0", () => {
		expect(numberArray(5)).toEqual([0, 1, 2, 3, 4]);
	});
});
