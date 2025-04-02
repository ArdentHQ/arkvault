import { describe, expect, it } from "vitest";

import { isNumber } from "./is-number";
import { omitBy } from "./omit-by";

describe("omitBy", () => {
	it("should work with a function", () => {
		expect(omitBy({ a: 1, b: "2", c: 3 }, isNumber)).toEqual({ b: "2" });
	});
});
