import { describe, expect, it } from "vitest";

import { CURRENCIES } from "./currencies";

describe("CURRENCIES", () => {
	it("should have the correct structure for all currencies", () => {
		// Test USD
		expect(CURRENCIES.USD).toEqual({
			decimals: 2,
			symbol: "$",
		});

		// Test EUR
		expect(CURRENCIES.EUR).toEqual({
			decimals: 2,
			symbol: "€",
		});

		// Test JPY (0 decimals)
		expect(CURRENCIES.JPY).toEqual({
			decimals: 0,
			symbol: "¥",
		});

		// Test BTC (8 decimals)
		expect(CURRENCIES.BTC).toEqual({
			decimals: 8,
			symbol: "Ƀ",
		});
	});

	it("should have valid decimal values", () => {
		for (const [_, data] of Object.entries(CURRENCIES)) {
			expect(typeof data.decimals).toBe("number");
			expect(data.decimals).toBeGreaterThanOrEqual(0);
			expect(data.decimals).toBeLessThanOrEqual(8);
		}
	});

	it("should have valid symbol values", () => {
		for (const [_, data] of Object.entries(CURRENCIES)) {
			expect(typeof data.symbol).toBe("string");
			expect(data.symbol.length).toBeGreaterThan(0);
		}
	});

	it("should have all required currencies", () => {
		const requiredCurrencies = ["USD", "EUR", "GBP", "JPY", "BTC", "ETH", "LTC"];

		for (const currency of requiredCurrencies) {
			expect(CURRENCIES).toHaveProperty(currency);
		}
	});
});
