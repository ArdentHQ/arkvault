import { compoundWords } from "./compound-words";

describe("compoundWords", () => {
	it("should return undefined if the given string is empty", () => {
		expect(compoundWords("", (word) => word)).toBeUndefined();
	});

	it("should return a list of words", () => {
		expect(compoundWords("fred, barney, & pebbles", (result, word) => `${result} ${word}`.trim())).toBe(
			"fred barney pebbles",
		);
	});
});
