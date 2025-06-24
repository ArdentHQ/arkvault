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
});
