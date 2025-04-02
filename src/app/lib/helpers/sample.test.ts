import { describe, expect, it } from "vitest";

import { sample } from "./sample";

describe("sample", () => {
	it("should return a random item", () => {
		expect(typeof sample([1, 2, 3, 4, 5])).toBe("number");
	});
});
