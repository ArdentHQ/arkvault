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
	});

	it.each(["BTC", "ETH", "ARK", "DARK", "LSK", "BIND", "SOL"])(
		"should format crypto (%s)",
		(dataset) => {
			expect(Currency.format(10, dataset)).toBe(`10 ${dataset}`);
		},
	);

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
	])("should allow to hide ticker (%s)", (dataset) => {
		expect(Currency.format(10, dataset, { withTicker: false })).toBe("10.00");
	});

	it("should allow to pass locale", () => {
		expect(Currency.format(1, "BTC", { locale: "en-US" })).toBe("1 BTC");
		expect(Currency.format(1, "USD", { locale: "en-US" })).toBe("$1.00");
	});
});
