import { describe, expect, it } from "vitest";

import { last } from "./last";

describe("last", () => {
	it("should return the last item", () => {
		expect(last([1, 2, 3, 4, 5])).toBe(5);
	});
});
