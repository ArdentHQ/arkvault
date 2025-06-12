import { describe, it, expect, vi } from "vitest";
import { MarketService } from "./index";
import { PriceTracker } from "./contracts";
import { Http } from "@/app/lib/mainsail";

const createMockAdapter = (): PriceTracker => ({
	currentPrice: vi.fn(),
	dailyAverage: vi.fn(),
	historicalPrice: vi.fn(),
	historicalVolume: vi.fn(),
	marketData: vi.fn(),
	verifyToken: vi.fn(),
});

describe("MarketService", () => {
	it("should be able to be instantiated", () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		expect(marketService).toBeInstanceOf(MarketService);
	});

	it.each(["coincap", "coingecko", "cryptocompare"])("should make a service for %s", (adapter) => {
		const marketService = MarketService.make(adapter, new Http.HttpClient(0));
		expect(marketService).toBeInstanceOf(MarketService);
	});

	it("should set the adapter", async () => {
		const adapter1 = createMockAdapter();
		const marketService = new MarketService(adapter1);

		const adapter2 = createMockAdapter();
		marketService.setAdapter(adapter2);

		await marketService.verifyToken("ark");
		expect(adapter1.verifyToken).not.toHaveBeenCalled();
		expect(adapter2.verifyToken).toHaveBeenCalledWith("ark");
	});

	it("should verify a token", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		await marketService.verifyToken("ark");
		expect(adapter.verifyToken).toHaveBeenCalledWith("ark");
	});

	it("should get market data", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		await marketService.marketData("ark");
		expect(adapter.marketData).toHaveBeenCalledWith("ark");
	});

	it("should get historical price", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const options = { currency: "usd", dateFormat: "YYYY-MM-DD", days: 1, token: "ark", type: "day" as const };
		await marketService.historicalPrice(options);
		expect(adapter.historicalPrice).toHaveBeenCalledWith(options);
	});

	it("should get historical price for day", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const historicalPriceSpy = vi.spyOn(marketService, "historicalPrice");
		await marketService.historicalPriceForDay("ark", "usd");
		expect(historicalPriceSpy).toHaveBeenCalledWith({
			currency: "usd",
			dateFormat: "HH:mm",
			days: 24,
			token: "ark",
			type: "hour",
		});
	});

	it("should get historical price for week", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const historicalPriceSpy = vi.spyOn(marketService, "historicalPrice");
		await marketService.historicalPriceForWeek("ark", "usd");
		expect(historicalPriceSpy).toHaveBeenCalledWith({
			currency: "usd",
			dateFormat: "ddd",
			days: 7,
			token: "ark",
			type: "day",
		});
	});

	it("should get historical price for month", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const historicalPriceSpy = vi.spyOn(marketService, "historicalPrice");
		await marketService.historicalPriceForMonth("ark", "usd");
		expect(historicalPriceSpy).toHaveBeenCalledWith({
			currency: "usd",
			dateFormat: "DD",
			days: 30,
			token: "ark",
			type: "day",
		});
	});

	it("should get historical price for quarter", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const historicalPriceSpy = vi.spyOn(marketService, "historicalPrice");
		await marketService.historicalPriceForQuarter("ark", "usd");
		expect(historicalPriceSpy).toHaveBeenCalledWith({
			currency: "usd",
			dateFormat: "DD.MM",
			days: 120,
			token: "ark",
			type: "day",
		});
	});

	it("should get historical price for year", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const historicalPriceSpy = vi.spyOn(marketService, "historicalPrice");
		await marketService.historicalPriceForYear("ark", "usd");
		expect(historicalPriceSpy).toHaveBeenCalledWith({
			currency: "usd",
			dateFormat: "DD.MM",
			days: 365,
			token: "ark",
			type: "day",
		});
	});

	it("should get historical volume", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const options = { currency: "usd", dateFormat: "YYYY-MM-DD", days: 1, token: "ark", type: "day" as const };
		await marketService.historicalVolume(options);
		expect(adapter.historicalVolume).toHaveBeenCalledWith(options);
	});

	it("should get historical volume for day", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const historicalVolumeSpy = vi.spyOn(marketService, "historicalVolume");
		await marketService.historicalVolumeForDay("ark", "usd");
		expect(historicalVolumeSpy).toHaveBeenCalledWith({
			currency: "usd",
			dateFormat: "HH:mm",
			days: 24,
			token: "ark",
			type: "hour",
		});
	});

	it("should get historical volume for week", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const historicalVolumeSpy = vi.spyOn(marketService, "historicalVolume");
		await marketService.historicalVolumeForWeek("ark", "usd");
		expect(historicalVolumeSpy).toHaveBeenCalledWith({
			currency: "usd",
			dateFormat: "ddd",
			days: 7,
			token: "ark",
			type: "day",
		});
	});

	it("should get historical volume for month", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const historicalVolumeSpy = vi.spyOn(marketService, "historicalVolume");
		await marketService.historicalVolumeForMonth("ark", "usd");
		expect(historicalVolumeSpy).toHaveBeenCalledWith({
			currency: "usd",
			dateFormat: "DD",
			days: 30,
			token: "ark",
			type: "day",
		});
	});

	it("should get historical volume for quarter", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const historicalVolumeSpy = vi.spyOn(marketService, "historicalVolume");
		await marketService.historicalVolumeForQuarter("ark", "usd");
		expect(historicalVolumeSpy).toHaveBeenCalledWith({
			currency: "usd",
			dateFormat: "DD.MM",
			days: 120,
			token: "ark",
			type: "day",
		});
	});

	it("should get historical volume for year", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const historicalVolumeSpy = vi.spyOn(marketService, "historicalVolume");
		await marketService.historicalVolumeForYear("ark", "usd");
		expect(historicalVolumeSpy).toHaveBeenCalledWith({
			currency: "usd",
			dateFormat: "DD.MM",
			days: 365,
			token: "ark",
			type: "day",
		});
	});

	it("should get daily average", async () => {
		const adapter = createMockAdapter();
		const marketService = new MarketService(adapter);
		const timestamp = Date.now();
		await marketService.dailyAverage("ark", "usd", timestamp);
		expect(adapter.dailyAverage).toHaveBeenCalledWith({ currency: "usd", timestamp, token: "ark" });
	});
});
