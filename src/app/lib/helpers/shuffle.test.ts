import { describe, expect, it } from "vitest";

import { numberArray } from "./number-array";
import { shuffle } from "./shuffle";

describe("shuffle", () => {
	it("should return a new array with items in random order", () => {
		const possibleValues = numberArray(100);
		const shuffledValues = shuffle(possibleValues);

		expect(shuffledValues).toEqual(expect.arrayContaining(possibleValues));
		expect(shuffledValues).not.toBe(possibleValues);
	});
});
