import { describe } from "@ardenthq/sdk-test";

import { compoundWords } from "./compound-words";

describe("compoundWords", async ({ assert, it, nock, loader }) => {
	it("should return undefined if the given string is empty", () => {
		assert.undefined(compoundWords("", (word) => word));
	});

	it("should return a list of words", () => {
		assert.is(
			compoundWords("fred, barney, & pebbles", (result, word) => `${result} ${word}`.trim()),
			"fred barney pebbles",
		);
	});
});
