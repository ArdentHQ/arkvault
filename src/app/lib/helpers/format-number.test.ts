import { describe } from "@ardenthq/sdk-test";

import { formatNumber } from "./format-number";

describe("formatNumber", async ({ assert, it, nock, loader }) => {
	it("should format the given number", () => {
		assert.is(formatNumber(123456.789, "de-DE", { style: "currency", currency: "EUR" }), "123.456,79 €");
		assert.is(formatNumber(123456.789, "en-UK", { style: "currency", currency: "GBP" }), "£123,456.79");
		assert.is(formatNumber(123456.789, "jp-JP", { style: "currency", currency: "JPY" }), "¥123,457");
		assert.is(formatNumber(123456.789, "en-US", { maximumSignificantDigits: 3 }), "123,000");
	});
});
