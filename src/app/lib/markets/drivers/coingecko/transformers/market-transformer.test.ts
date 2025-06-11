import { describe, it, expect } from "vitest";
import { MarketTransformer } from "./market-transformer";

const fixture = {
	current_price: { usd: 1, btc: 0.00002 },
	market_cap: { usd: 1000000, btc: 20 },
	total_volume: { usd: 50000, btc: 1 },
	market_cap_change_percentage_24h_in_currency: { usd: 5, btc: 2 },
	last_updated: "2021-01-01T00:00:00.000Z",
};

describe("MarketTransformer", () => {
	it("should transform the given data", () => {
		const transformer = new MarketTransformer(fixture);
		const result = transformer.transform({ currencies: { USD: {}, BTC: {} } });

		expect(result.USD.price).toBe(1);
		expect(result.BTC.price).toBe(0.00002);
		expect(result.USD.marketCap).toBe(1000000);
		expect(result.BTC.marketCap).toBe(20);
		expect(result.USD.volume).toBe(50000);
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
