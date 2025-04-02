import { describe, expect, it } from "vitest";

import { mapArray } from "./map-array";

describe("mapArray", () => {
	it("should work like lodash", () => {
		expect(mapArray([4, 8], (n) => n * n)).toEqual([16, 64]);
	});
});
