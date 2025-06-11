import { describe, it, expect } from "vitest";
import { convertToCurrency } from "./utils";

const rates = {
	USD: 1,
	EUR: 0.9,
	BTC: 0.00002,
};

const base = "USD";

describe("convertToCurrency", () => {
	it("should convert from base currency", () => {
		const result = convertToCurrency(100, { from: "USD", to: "EUR", base, rates });
		expect(result).toBeCloseTo(90);
	});

	it("should convert to base currency", () => {
		const result = convertToCurrency(1, { from: "BTC", to: "USD", base, rates });
		expect(result).toBeCloseTo(50000);
	});

	it("should convert between two non-base currencies", () => {
		const result = convertToCurrency(1, { from: "BTC", to: "EUR", base, rates });
		expect(result).toBeCloseTo(45000);
	});

	it("should throw if from or to currency is missing in rates", () => {
		expect(() => convertToCurrency(1, { from: "ETH", to: "USD", base, rates })).toThrow(
			"`rates` object does not contain either `from` or `to` currency!",
		);
		expect(() => convertToCurrency(1, { from: "USD", to: "ETH", base, rates })).toThrow(
			"`rates` object does not contain either `from` or `to` currency!",
		);
	});

	it("should throw if from or to is not specified", () => {
		expect(() => convertToCurrency(1, { base, rates } as any)).toThrow(
			"Please specify the `from` and/or `to` currency or use parsing!",
		);
	});
});
