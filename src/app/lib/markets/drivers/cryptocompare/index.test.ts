import { describe, it, expect, vi, afterEach } from "vitest";
import { Http } from "@/app/lib/mainsail";
import { server, requestMock } from "@/tests/mocks/server";
import { CryptoCompare } from "./index";

const pricemultifullFixture = {
	RAW: {
		ARK: {
			USD: {
				PRICE: 1.0,
				MKTCAP: 100000000,
				TOTALVOLUME24H: 1000000,
				CHANGEPCT24HOUR: 1.0,
			},
		},
	},
};
const histodayFixture = {
	Data: [
		{ time: 1616025600, close: 1.05, volumeto: 1000 },
		{ time: 1616112000, close: 1.15, volumeto: 2200 },
	],
};
const priceFixture = { USD: 1.23, BTC: 0.000025 };

describe("CryptoCompare", () => {
	afterEach(() => {
		vi.clearAllMocks();
		server.resetHandlers();
	});

	it("should verify a token", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/price", priceFixture));
		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.verifyToken("ARK");
		expect(result).toBe(true);
	});

	it("should fail to verify a token", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/price", {}));
		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.verifyToken("invalid");
		expect(result).toBe(false);
	});

	it("should get market data", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/pricemultifull", pricemultifullFixture));
		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.marketData("ARK");
		expect(result.USD.price).toBe(1.0);
	});

	it("should get historical price data", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/histoday", histodayFixture));
		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.historicalPrice({
			token: "ARK",
			currency: "USD",
			days: 1,
			type: "day",
			dateFormat: "YYYY-MM-DD",
		});
		expect(result.labels).toHaveLength(2);
		expect(result.datasets).toHaveLength(2);
	});

	it("should get historical volume data", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/histoday", histodayFixture));
		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.historicalVolume({
			token: "ARK",
			currency: "USD",
			days: 1,
			type: "day",
			dateFormat: "YYYY-MM-DD",
		});
		expect(result.labels).toHaveLength(2);
		expect(result.datasets).toHaveLength(2);
	});

	it("should get daily average price", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/dayAvg", priceFixture));
		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.dailyAverage({
			token: "ARK",
			currency: "USD",
			timestamp: Date.now(),
		});
		expect(result).toBe(1.23);
	});

	it("should get current price", async () => {
		server.use(requestMock("https://min-api.cryptocompare.com/data/price", priceFixture));
		const tracker = new CryptoCompare(new Http.HttpClient(0));
		const result = await tracker.currentPrice({ token: "ARK", currency: "USD" });
		expect(result).toBe(1.23);
	});
});
