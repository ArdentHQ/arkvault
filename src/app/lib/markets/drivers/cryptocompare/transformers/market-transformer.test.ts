import { describe, it, expect } from "vitest";
import { MarketTransformer } from "./market-transformer";

const fixture = {
	USD: {
		TOSYMBOL: "USD",
		CHANGEPCT24HOUR: 1,
		LASTUPDATE: 1616112000,
		MKTCAP: 100000000,
		PRICE: 1,
		TOTALVOLUME24HTO: 1000000,
	},
	BTC: {
		TOSYMBOL: "BTC",
		CHANGEPCT24HOUR: 2,
		LASTUPDATE: 1616112000,
		MKTCAP: 20,
		PRICE: 0.00002,
		TOTALVOLUME24HTO: 1,
	},
};

describe("MarketTransformer", () => {
	it("should transform the given data", () => {
		const transformer = new MarketTransformer(fixture);
		const result = transformer.transform();

		expect(result.USD.price).toBe(1);
		expect(result.BTC.price).toBe(0.00002);
		expect(result.USD.marketCap).toBe(100000000);
		expect(result.BTC.marketCap).toBe(20);
	});
});
