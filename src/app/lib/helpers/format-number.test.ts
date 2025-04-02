import { formatNumber } from "./format-number";

describe("formatNumber", () => {
	it("should format the given number", () => {
		expect(formatNumber(123_456.789, "de-DE", { currency: "EUR", style: "currency" })).toBe("123.456,79 €");
		expect(formatNumber(123_456.789, "en-UK", { currency: "GBP", style: "currency" })).toBe("£123,456.79");
		expect(formatNumber(123_456.789, "jp-JP", { currency: "JPY", style: "currency" })).toBe("¥123,457");
		expect(formatNumber(123_456.789, "en-US", { maximumSignificantDigits: 3 })).toBe("123,000");
	});
});
