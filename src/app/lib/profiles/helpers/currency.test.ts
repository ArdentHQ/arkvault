import { describe, it, expect } from "vitest";
import { Currency } from "./currency.js";

describe("Helpers.Currency", () => {
	it("should format fiat", () => {
		expect(Currency.format(10, "USD")).toBe("$10.00");
	});

	it("should round and format fiat", () => {
		expect(Currency.format(0.116, "USD")).toBe("$0.12");
	});

	it("should format fiat without decimals", () => {
		expect(Currency.format(10, "KRW")).toBe("₩10.00");
		expect(Currency.format(10, "JPY")).toBe("¥10.00");
	});

	it.each(["BTC", "ETH", "ARK", "DARK", "LSK", "BIND", "SOL"])("should format crypto (%s)", (currency) => {
		expect(Currency.format(10, currency)).toBe(`10 ${currency}`);
	});

	it.each([
		"AUD",
		"BRL",
		"CAD",
		"CHF",
		"CNY",
		"DKK",
		"EUR",
		"GBP",
		"HKD",
		"IDR",
		"INR",
		"MXN",
		"NOK",
		"RUB",
		"SEK",
		"USD",
	])("should allow to hide ticker (%s)", (currency) => {
		expect(Currency.format(10, currency, { withTicker: false })).toBe("10.00");
	});

	it("should allow to hide ticker for crypto", () => {
		expect(Currency.format(10, "BTC", { withTicker: false })).toBe("10");
	});

	it("should allow to pass locale", () => {
		expect(Currency.format(1, "BTC", { locale: "en-US" })).toBe("1 BTC");
		expect(Currency.format(1, "USD", { locale: "en-US" })).toBe("$1.00");
	});

	it("should handle small values without suffix", () => {
		expect(Currency.formatCompact(100, "USD")).toBe("$100.00");
	});

	it("should format compact values with M suffix", () => {
		expect(Currency.formatCompact(1500000, "USD")).toBe("1.50M USD");
	});

	it("should allow to options to use ticker and decimals", () => {
		expect(Currency.formatCompact(1550, "USD", { withTicker: true })).toBe("1.55K USD");
		expect(Currency.formatCompact(1556, "USD", { compactDecimals: 2, withTicker: false })).toBe("1.56K");
	});
});
