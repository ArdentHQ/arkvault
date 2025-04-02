import { formatNumber } from "./format-number";

describe("formatNumber", () => {
	it("should format the given number", () => {
		expect(formatNumber(123456.789, "de-DE", { style: "currency", currency: "EUR" })).toBe("123.456,79 €");
		expect(formatNumber(123456.789, "en-UK", { style: "currency", currency: "GBP" })).toBe("£123,456.79");
		expect(formatNumber(123456.789, "jp-JP", { style: "currency", currency: "JPY" })).toBe("¥123,457");
		expect(formatNumber(123456.789, "en-US", { maximumSignificantDigits: 3 })).toBe("123,000");
	});
});
