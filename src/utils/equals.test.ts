import "jest-extended";

import { lowerCaseEquals } from "./equals";

describe("#lowerCaseEquals", () => {
	it("should be false because of A", () => {
		expect(lowerCaseEquals(undefined, "B")).toBe(false);
	});

	it("should be false because of B", () => {
		expect(lowerCaseEquals("A", undefined)).toBe(false);
	});

	it("should be false because A and B are not equal", () => {
		expect(lowerCaseEquals("A", "B")).toBe(false);
	});

	it("should be true because A and B are equal", () => {
		expect(lowerCaseEquals("A", "A")).toBe(true);
	});
});
