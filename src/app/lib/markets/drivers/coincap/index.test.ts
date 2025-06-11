import { describe, it, expect, vi, afterEach } from "vitest";
import { Http } from "@/app/lib/mainsail";
import { server, requestMock } from "@/tests/mocks/server";
import { CoinCap } from "./index";

const assetsFixture = {
	data: [
		{ id: "ark", symbol: "ARK", priceUsd: "1.00", marketCapUsd: "100000000" },
		{ id: "bitcoin", symbol: "BTC", priceUsd: "50000.00" },
	],
};
const ratesFixture = {
	data: [{ symbol: "USD", rateUsd: "1.00" }],
};
const historyFixture = {
	data: [
		{ priceUsd: "1.00", time: 1616025600000 },
		{ priceUsd: "1.10", time: 1616112000000 },
	],
};

describe("CoinCap", () => {
	afterEach(() => {
		vi.clearAllMocks();
		server.resetHandlers();
	});

	it("should verify a token", async () => {
		server.use(requestMock("https://api.coincap.io/v2/assets", assetsFixture));
		server.use(requestMock("https://api.coincap.io/v2/assets/ark", { data: assetsFixture.data[0] }));

		const tracker = new CoinCap(new Http.HttpClient(0));
		const result = await tracker.verifyToken("ARK");
		expect(result).toBe(true);
	});

	it("should return false for a token that does not exist", async () => {
		server.use(requestMock("https://api.coincap.io/v2/assets", { data: [] }));

		const tracker = new CoinCap(new Http.HttpClient(0));
		const result = await tracker.verifyToken("invalid");
		expect(result).toBe(false);
	});

	it("should get market data", async () => {
		server.use(requestMock("https://api.coincap.io/v2/assets", assetsFixture));
		server.use(requestMock("https://api.coincap.io/v2/assets/ark", { data: assetsFixture.data[0] }));
		server.use(requestMock("https://api.coincap.io/v2/rates", ratesFixture));

		const tracker = new CoinCap(new Http.HttpClient(0));
		const result = await tracker.marketData("ARK");

		expect(result.USD.price).toBe(1);
		expect(result.USD.marketCap).toBe(100000000);
	});

	it("should get market data for a token without a market cap", async () => {
		const fixture = { data: { ...assetsFixture.data[0], marketCapUsd: undefined } };
		server.use(requestMock("https://api.coincap.io/v2/assets", { data: [fixture.data] }));
		server.use(requestMock("https://api.coincap.io/v2/assets/ark", fixture));
		server.use(requestMock("https://api.coincap.io/v2/rates", ratesFixture));

		const tracker = new CoinCap(new Http.HttpClient(0));
		const result = await tracker.marketData("ARK");

		expect(result.USD.price).toBe(1);
		expect(result.USD.marketCap).toBe(NaN); // divided by undefined
	});

	it("should throw for invalid market data token", async () => {
		server.use(requestMock("https://api.coincap.io/v2/assets", { data: [] }));

		const tracker = new CoinCap(new Http.HttpClient(0));
		await expect(tracker.marketData("invalid")).rejects.toThrow("Failed to determine the token.");
	});

	it("should get historical price data", async () => {
		server.use(requestMock("https://api.coincap.io/v2/assets", assetsFixture));
		server.use(requestMock("https://api.coincap.io/v2/assets/ark", { data: assetsFixture.data[0] }));
		server.use(requestMock("https://api.coincap.io/v2/assets/ark/history", historyFixture));
		server.use(requestMock("https://api.coincap.io/v2/rates", ratesFixture));

		const tracker = new CoinCap(new Http.HttpClient(0));
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

	it("should throw when getting historical volume", async () => {
		const tracker = new CoinCap(new Http.HttpClient(0));
		await expect(tracker.historicalVolume()).rejects.toThrow("Method CoinCap#historicalVolume is not implemented.");
	});

	it("should get daily average price", async () => {
		server.use(requestMock("https://api.coincap.io/v2/assets", assetsFixture));
		server.use(requestMock("https://api.coincap.io/v2/assets/ark/history", historyFixture));
		server.use(
			requestMock("https://api.coincap.io/v2/rates", {
				data: [{ symbol: "USD", rateUsd: "1" }],
			}),
		);

		const tracker = new CoinCap(new Http.HttpClient(0));
		const result = await tracker.dailyAverage({
			token: "ARK",
			currency: "USD",
			timestamp: Date.now(),
		});
		expect(result).toBe(1.05);
	});

	it("should return 0 for daily average with no data", async () => {
		server.use(requestMock("https://api.coincap.io/v2/assets", assetsFixture));
		server.use(requestMock("https://api.coincap.io/v2/assets/ark/history", { data: [] }));

		const tracker = new CoinCap(new Http.HttpClient(0));
		const result = await tracker.dailyAverage({
			token: "ARK",
			currency: "USD",
			timestamp: Date.now(),
		});
		expect(result).toBe(0);
	});

	it("should get current price", async () => {
		server.use(requestMock("https://api.coincap.io/v2/assets", assetsFixture));
		server.use(requestMock("https://api.coincap.io/v2/assets/ark/history", historyFixture));
		server.use(
			requestMock("https://api.coincap.io/v2/rates", {
				data: [{ symbol: "USD", rateUsd: "1" }],
			}),
		);

		const tracker = new CoinCap(new Http.HttpClient(0));
		const result = await tracker.currentPrice({ token: "ARK", currency: "USD" });
		expect(result).toBe(1.05);
	});
});
