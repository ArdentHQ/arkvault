import { describe, it, expect } from "vitest";
import { convertToCurrency } from "./utils";

const rates = {
	BTC: 0.000_02,
	EUR: 0.9,
	USD: 1,
};

const base = "USD";

describe("convertToCurrency", () => {
	it("should convert from base currency", () => {
		const result = convertToCurrency(100, { base, from: "USD", rates, to: "EUR" });
		expect(result).toBeCloseTo(90);
	});

	it("should convert to base currency", () => {
		const result = convertToCurrency(1, { base, from: "BTC", rates, to: "USD" });
		expect(result).toBeCloseTo(50_000);
	});

	it("should convert between two non-base currencies", () => {
		const result = convertToCurrency(1, { base, from: "BTC", rates, to: "EUR" });
		expect(result).toBeCloseTo(45_000);
	});

	it("should throw if from or to currency is missing in rates", () => {
		expect(() => convertToCurrency(1, { base, from: "ETH", rates, to: "USD" })).toThrow(
			"`rates` object does not contain either `from` or `to` currency!",
		);
		expect(() => convertToCurrency(1, { base, from: "USD", rates, to: "ETH" })).toThrow(
			"`rates` object does not contain either `from` or `to` currency!",
		);
	});

	it("should throw if from or to is not specified", () => {
		expect(() => convertToCurrency(1, { base, rates } as any)).toThrow(
			"Please specify the `from` and/or `to` currency or use parsing!",
		);
	});
});
