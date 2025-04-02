import { describe } from "@ardenthq/sdk-test";

import { numberArray } from "./number-array";
import { shuffle } from "./shuffle";

describe("shuffle", async ({ assert, it, nock, loader }) => {
	it("should return a new array with items in random order", () => {
		const possibleValues = numberArray(100);
		const shuffledValues = shuffle(possibleValues);

		assert.includeAllMembers(shuffledValues, possibleValues);
		assert.not.equal(shuffledValues, possibleValues);
	});
});
