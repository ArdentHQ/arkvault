import { describe, it, expect } from "vitest";
import { MarketTransformer } from "./market-transformer";

const fixture = {
	current_price: { btc: 0.000_02, usd: 1 },
	last_updated: "2021-01-01T00:00:00.000Z",
	market_cap: { btc: 20, usd: 1_000_000 },
	market_cap_change_percentage_24h_in_currency: { btc: 2, usd: 5 },
	total_volume: { btc: 1, usd: 50_000 },
};

describe("MarketTransformer", () => {
	it("should transform the given data", () => {
		const transformer = new MarketTransformer(fixture);
		const result = transformer.transform({ currencies: { BTC: {}, USD: {} } });

		expect(result.USD.price).toBe(1);
		expect(result.BTC.price).toBe(0.000_02);
		expect(result.USD.marketCap).toBe(1_000_000);
		expect(result.BTC.marketCap).toBe(20);
		expect(result.USD.volume).toBe(50_000);
		expect(result.BTC.volume).toBe(1);
		expect(result.USD.change24h).toBe(5);
		expect(result.BTC.change24h).toBe(2);
	});

	it("should skip currencies that are not present in the data", () => {
		const transformer = new MarketTransformer(fixture);
		const result = transformer.transform({ currencies: { ETH: {} } });
		expect(result).toEqual({});
	});
});
