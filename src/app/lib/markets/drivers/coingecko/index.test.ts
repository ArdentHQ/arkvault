import { describe, it, expect, vi, afterEach } from "vitest";
import { Http } from "@/app/lib/mainsail";
import { server, requestMock } from "@/tests/mocks/server";
import { CoinGecko } from "./index";

const coinsListFixture = [
	{ id: "ark", symbol: "ark", name: "Ark" },
	{ id: "bitcoin", symbol: "btc", name: "Bitcoin" },
];

const coinFixture = {
	id: "ark",
	symbol: "ark",
	name: "Ark",
	market_data: {
		current_price: { usd: 1.0 },
		market_cap: { usd: 100000000 },
		total_volume: { usd: 1000000 },
		price_change_percentage_24h: 1.0,
		market_cap_change_percentage_24h_in_currency: { usd: 1.0 },
		last_updated: "2021-01-01T00:00:00.000Z",
	},
};

const marketChartFixture = {
	prices: Array.from({ length: 50 }, (_, i) => [i * 1000, i]),
	market_caps: Array.from({ length: 50 }, (_, i) => [i * 1000, i * 100]),
	total_volumes: Array.from({ length: 50 }, (_, i) => [i * 1000, i * 10]),
};

const simplePriceFixture = { ark: { btc: 0.00002 } };

const historyFixture = {
	id: "ark",
	symbol: "ark",
	name: "Ark",
	market_data: { current_price: { usd: 1.23 } },
};

describe("CoinGecko", () => {
	afterEach(() => {
		vi.clearAllMocks();
		server.resetHandlers();
	});

	it("should verify a token", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/simple/price", simplePriceFixture));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.verifyToken("ARK");
		expect(result).toBe(true);
	});

	it("should fail to verify a token", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/simple/price", {}));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.verifyToken("invalid");
		expect(result).toBe(false);
	});

	it("should get market data", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/ark", coinFixture));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.marketData("ARK");
		expect(result.USD.price).toBe(1.0);
	});

	it("should get historical price data", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/ark/market_chart", marketChartFixture));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.historicalPrice({
			token: "ARK",
			currency: "USD",
			days: 1,
			type: "day",
			dateFormat: "YYYY-MM-DD",
		});
		expect(result.labels).toHaveLength(3);
		expect(result.datasets).toHaveLength(3);
	});

	it("should get historical volume data", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/ark/market_chart/range", marketChartFixture));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.historicalVolume({
			token: "ARK",
			currency: "USD",
			days: 1,
			type: "day",
			dateFormat: "YYYY-MM-DD",
		});
		expect(result.labels).toHaveLength(3);
		expect(result.datasets).toHaveLength(3);
	});

	it("should get daily average price", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/ark/history", historyFixture));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.dailyAverage({
			token: "ARK",
			currency: "USD",
			timestamp: Date.now(),
		});
		expect(result).toBe(1.23);
	});

	it("should get current price", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/simple/price", { ark: { usd: 1.3 } }));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.currentPrice({ token: "ARK", currency: "USD" });
		expect(result).toBe(1.3);
	});
});
