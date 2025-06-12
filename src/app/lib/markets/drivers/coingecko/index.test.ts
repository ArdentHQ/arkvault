/* eslint-disable sonarjs/no-duplicate-string */
import { describe, it, expect, vi, afterEach } from "vitest";
import { Http } from "@/app/lib/mainsail";
import { server, requestMock } from "@/tests/mocks/server";
import { CoinGecko } from "./index";

import coinsListFixture from "@/app/lib/markets/fixtures/coingecko/coins-list.json";
import simplePriceFixture from "@/app/lib/markets/fixtures/coingecko/simple-price.json";
import coinFixture from "@/app/lib/markets/fixtures/coingecko/coin.json";
import marketChartFixture from "@/app/lib/markets/fixtures/coingecko/market-chart.json";
import historyFixture from "@/app/lib/markets/fixtures/coingecko/history.json";

describe("CoinGecko", () => {
	afterEach(() => {
		vi.clearAllMocks();
		server.resetHandlers();
	});

	it("should verify a token", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/simple/price", simplePriceFixture));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.verifyToken("ark");
		expect(result).toBe(true);
	});

	it("should fail to verify a token", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/simple/price", {}, { status: 500 }));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.verifyToken("invalid");
		expect(result).toBe(false);
	});

	it("should get market data", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/ark", coinFixture));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.marketData("ARK");
		expect(result.USD.price).toBe(0.389_486);

		// This will hit the cache
		await tracker.marketData("ARK");
	});

	it("should get historical price data", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/ark/market_chart", marketChartFixture));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.historicalPrice({
			currency: "USD",
			dateFormat: "YYYY-MM-DD",
			days: 1,
			token: "ARK",
			type: "day",
		});
		expect(result.labels).toHaveLength(12);
		expect(result.datasets).toHaveLength(12);
	});

	it("should get historical volume data", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/ark/market_chart/range", marketChartFixture));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.historicalVolume({
			currency: "USD",
			dateFormat: "YYYY-MM-DD",
			days: 1,
			token: "ARK",
			type: "day",
		});
		expect(result.labels).toHaveLength(12);
		expect(result.datasets).toHaveLength(12);
	});

	it("should get daily average price", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/ark/history", historyFixture));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.dailyAverage({
			currency: "USD",
			timestamp: Date.now(),
			token: "ARK",
		});
		expect(result).toBe(0.396_214_441_406_628_1);
	});

	it("should get current price", async () => {
		server.use(requestMock("https://api.coingecko.com/api/v3/coins/list", coinsListFixture));
		server.use(requestMock("https://api.coingecko.com/api/v3/simple/price", { ark: { usd: 1.3 } }));

		const tracker = new CoinGecko(new Http.HttpClient(0));
		const result = await tracker.currentPrice({ currency: "USD", token: "ARK" });
		expect(result).toBe(1.3);
	});
});
