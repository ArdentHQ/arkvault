import { describe, it, expect, vi, afterEach } from "vitest";
import { Http } from "@/app/lib/mainsail";
import { server, requestMock } from "@/tests/mocks/server";
import { CryptoCompare } from "./index";

import pricemultifullFixture from "@/app/lib/markets/fixtures/cryptocompare/pricemultifull.json";
import priceFixture from "@/app/lib/markets/fixtures/cryptocompare/price.json";
import histodayFixture from "@/app/lib/markets/fixtures/cryptocompare/histoday.json";

describe("CryptoCompare", () => {
	afterEach(() => {
		vi.clearAllMocks();
		server.resetHandlers();
	});

	it("should verify a token", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/price", { BTC: 1 }));

		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.verifyToken("ARK");
		expect(result).toBe(true);
	});

	it("should fail to verify a token", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/price", {}, { status: 500 }));

		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.verifyToken("invalid");
		expect(result).toBe(false);
	});

	it("should get market data", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/pricemultifull", pricemultifullFixture));

		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.marketData("ARK");
		expect(result.USD.price).toBe(0.390_237_877_504_627_1);
	});

	it("should get market data with an empty response", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/pricemultifull", {}));

		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.marketData("ARK");
		expect(result).toEqual({});
	});

	it("should get historical price data", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/v2/histoday", histodayFixture));
		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.historicalPrice({
			currency: "USD",
			dateFormat: "YYYY-MM-DD",
			days: 1,
			token: "ARK",
			type: "day",
		});
		expect(result.labels).toHaveLength(11);
		expect(result.datasets).toHaveLength(11);
	});

	it("should get historical volume data", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/v2/histoday", histodayFixture));
		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.historicalVolume({
			currency: "USD",
			dateFormat: "YYYY-MM-DD",
			days: 1,
			token: "ARK",
			type: "day",
		});
		expect(result.labels).toHaveLength(11);
		expect(result.datasets).toHaveLength(11);
	});

	it("should get daily average price", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/dayAvg", priceFixture));
		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.dailyAverage({
			currency: "USD",
			timestamp: Date.now(),
			token: "ARK",
		});
		expect(result).toBe(1.23);
	});

	it("should get current price", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/price", priceFixture));
		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.currentPrice({ currency: "USD", token: "ARK" });
		expect(result).toBe(1.23);
	});
});
