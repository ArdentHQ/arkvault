import { describe } from "@ardenthq/sdk-test";

import { Currency } from "./currency.js";

describe("Helpers.Currency", ({ assert, each, it }) => {
	it("should format fiat", () => {
		assert.is(Currency.format(10, "USD"), "$10.00");
	});

	it("should round and format fiat", () => {
		assert.is(Currency.format(0.116, "USD"), "$0.12");
	});

	it("should format fiat without decimals", () => {
		assert.is(Currency.format(10, "KRW"), "₩10.00");
	});

	each(
		"should format crypto (%s)",
		({ dataset }) => {
			assert.is(Currency.format(10, dataset), `10 ${dataset}`);
		},
		["BTC", "ETH", "ARK", "DARK", "LSK", "BIND", "SOL"],
	);

	each(
		"should allow to hide ticker (%s)",
		({ dataset }) => {
			assert.is(Currency.format(10, dataset, { withTicker: false }), "10.00");
		},
		[
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
		],
	);

	it("should allow to pass locale", () => {
		assert.is(Currency.format(1, "BTC", { locale: "en-US" }), "1 BTC");
		assert.is(Currency.format(1, "USD", { locale: "en-US" }), "$1.00");
	});
});
