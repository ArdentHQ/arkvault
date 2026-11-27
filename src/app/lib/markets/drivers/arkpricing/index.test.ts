import { describe, it, expect, vi, afterEach } from "vitest";
import { Http } from "@/app/lib/mainsail";
import { server, requestMock } from "@/tests/mocks/server";
import { ArkPricing } from "./index";

import marketFixture from "@/app/lib/markets/fixtures/arkpricing/market.json";
import priceFixture from "@/app/lib/markets/fixtures/arkpricing/price.json";
import historyDayFixture from "@/app/lib/markets/fixtures/arkpricing/history-day.json";
import averageFixture from "@/app/lib/markets/fixtures/arkpricing/average.json";

describe("ArkPricing", () => {
	afterEach(() => {
		vi.clearAllMocks();
		server.resetHandlers();
	});

	it("should verify a token", async () => {
		server.use(requestMock("https://pricing.ardenthq.com/api/v1/coins/ark/price", priceFixture));

		const tracker = new ArkPricing(new Http.HttpClient(0));
		const result = await tracker.verifyToken("ARK");
		expect(result).toBe(true);
	});

	it("should fail to verify a token", async () => {
		server.use(requestMock("https://pricing.ardenthq.com/api/v1/coins/invalid/price", {}, { status: 404 }));

		const tracker = new ArkPricing(new Http.HttpClient(0));
		const result = await tracker.verifyToken("invalid");
		expect(result).toBe(false);
	});

	it("should get market data", async () => {
		server.use(requestMock("https://pricing.ardenthq.com/api/v1/coins/ark/market", marketFixture));

		const tracker = new ArkPricing(new Http.HttpClient(0));
		const result = await tracker.marketData("ARK");
		expect(result.USD.price).toBe(0.412);
		expect(result.USD.marketCap).toBe(41_200_000);
		expect(result.BTC.price).toBe(0.000_009_76);
		expect(result.coin).toBeUndefined();
	});

	it("should get market data with an empty response", async () => {
		server.use(requestMock("https://pricing.ardenthq.com/api/v1/coins/ark/market", {}));

		const tracker = new ArkPricing(new Http.HttpClient(0));
		const result = await tracker.marketData("ARK");
		expect(result).toEqual({});
	});

	it("should get historical price data", async () => {
		server.use(requestMock("https://pricing.ardenthq.com/api/v1/coins/ark/history", historyDayFixture));

		const tracker = new ArkPricing(new Http.HttpClient(0));
		const result = await tracker.historicalPrice({
			currency: "USD",
			dateFormat: "YYYY-MM-DD",
			days: 30,
			token: "ARK",
			type: "day",
		});
		expect(result.labels).toHaveLength(3);
		expect(result.datasets).toHaveLength(3);
		expect(result.min).toBe(0.401);
		expect(result.max).toBe(0.412);
	});

	it("should get historical volume data", async () => {
		server.use(requestMock("https://pricing.ardenthq.com/api/v1/coins/ark/history", historyDayFixture));

		const tracker = new ArkPricing(new Http.HttpClient(0));
		const result = await tracker.historicalVolume({
			currency: "USD",
			dateFormat: "YYYY-MM-DD",
			days: 30,
			token: "ARK",
			type: "day",
		});
		expect(result.labels).toHaveLength(3);
		expect(result.datasets).toHaveLength(3);
		expect(result.min).toBe(1_100_000);
		expect(result.max).toBe(1_230_000);
	});

	it("should get daily average price", async () => {
		server.use(requestMock("https://pricing.ardenthq.com/api/v1/coins/ark/average", averageFixture));

		const tracker = new ArkPricing(new Http.HttpClient(0));
		const result = await tracker.dailyAverage({
			currency: "USD",
			timestamp: Date.now(),
			token: "ARK",
		});
		expect(result).toBe(0.41);
	});

	it("should get current price", async () => {
		server.use(requestMock("https://pricing.ardenthq.com/api/v1/coins/ark/price", priceFixture));

		const tracker = new ArkPricing(new Http.HttpClient(0));
		const result = await tracker.currentPrice({ currency: "USD", token: "ARK" });
		expect(result).toBe(0.412);
	});
});
