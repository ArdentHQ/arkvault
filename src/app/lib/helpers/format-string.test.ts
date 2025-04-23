import { describe, it, expect } from "vitest";
import { formatString } from "./format-string";

describe("formatString", () => {
	it("should format the string with an explicit positional index", () => {
		expect(formatString("{0} World", "Hello")).toBe("Hello World");
	});
});
