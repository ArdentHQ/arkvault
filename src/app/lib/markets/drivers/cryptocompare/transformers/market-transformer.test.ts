import { describe, it, expect } from "vitest";
import { MarketTransformer } from "./market-transformer";

const fixture = {
	BTC: {
		CHANGEPCT24HOUR: 2,
		LASTUPDATE: 1_616_112_000,
		MKTCAP: 20,
		PRICE: 0.000_02,
		TOSYMBOL: "BTC",
		TOTALVOLUME24HTO: 1,
	},
	USD: {
		CHANGEPCT24HOUR: 1,
		LASTUPDATE: 1_616_112_000,
		MKTCAP: 100_000_000,
		PRICE: 1,
		TOSYMBOL: "USD",
		TOTALVOLUME24HTO: 1_000_000,
	},
};

describe("MarketTransformer", () => {
	it("should transform the given data", () => {
		const transformer = new MarketTransformer(fixture);
		const result = transformer.transform();

		expect(result.USD.price).toBe(1);
		expect(result.BTC.price).toBe(0.000_02);
		expect(result.USD.marketCap).toBe(100_000_000);
		expect(result.BTC.marketCap).toBe(20);
	});
});
