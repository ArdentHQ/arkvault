import { describe, it, expect } from "vitest";
import { MarketTransformer } from "./market-transformer";

const fixture = {
	BTC: {
		change24h: 1.02,
		marketCap: 976,
		price: 0.000_009_76,
		timestamp: "2024-01-15T12:00:00Z",
		volume: 29.13,
	},
	USD: {
		change24h: 2.31,
		marketCap: 41_200_000,
		price: 0.412,
		timestamp: "2024-01-15T12:00:00Z",
		volume: 1_230_000,
	},
	coin: "ark",
};

describe("MarketTransformer", () => {
	it("should transform the given data", () => {
		const transformer = new MarketTransformer(fixture);
		const result = transformer.transform();

		expect(result.USD.price).toBe(0.412);
		expect(result.BTC.price).toBe(0.000_009_76);
		expect(result.USD.marketCap).toBe(41_200_000);
		expect(result.BTC.marketCap).toBe(976);
		expect(result.coin).toBeUndefined();
	});
});
