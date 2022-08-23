import { validateAscii, validatePattern } from "./validate-pattern";

const translationMockFunction = jest
	.fn()
	.mockImplementation((text, options) => `illegal characters ${options.characters}`);

describe("validatePattern", () => {
	it("should return true for valid patterns", () => {
		expect(validatePattern(translationMockFunction, "loremipsumissimplydummytext", /[a-z]+/)).toBe(true);
		expect(validatePattern(translationMockFunction, "0123456789", /\d+/)).toBe(true);
		expect(validatePattern(translationMockFunction, "!@$&_.", /[!$&.@_]+/)).toBe(true);
	});

	it("should return illegal characters for invalid pattern", () => {
		expect(validatePattern(translationMockFunction, "lorem ipsum 0-1", /[a-z]+/)).toBe(
			"illegal characters ' ', '-', '0', '1'",
		);
		expect(validatePattern(translationMockFunction, "0-1/2@3#", /\d+/)).toBe(
			"illegal characters '#', '-', '/', '@'",
		);
		expect(validatePattern(translationMockFunction, "!@4$5&8*9", /[!$&.@_]+/)).toBe(
			"illegal characters '*', '4', '5', '8', '9'",
		);
	});
});

describe("validateAscii", () => {
	it("should return true for valid patterns", () => {
		expect(validateAscii(translationMockFunction, "\x20")).toBe(true);
		expect(validateAscii(translationMockFunction, "0123456789")).toBe(true);
		expect(validateAscii(translationMockFunction, "!@$&_.")).toBe(true);
	});

	it("should return illegal characters for invalid pattern", () => {
		expect(validateAscii(translationMockFunction, "\x00")).toBe(`illegal characters '\x00'`);
		expect(validateAscii(translationMockFunction, "§")).toBe("illegal characters '§'");
	});
});
