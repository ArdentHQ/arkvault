import { describe, expect, it, vi, beforeEach } from "vitest";
import { DateTime } from "@/app/lib/intl";
import { ExchangeRateService } from "./exchange-rate.service";

vi.mock("@/app/lib/mainsail/http-client.js", () => ({
	HttpClient: vi.fn().mockImplementation(() => ({
		get: vi.fn().mockResolvedValue({ json: () => ({}) }),
	})),
}));

vi.mock("@/app/lib/markets", () => ({
	MarketService: {
		make: vi.fn().mockReturnValue({
			dailyAverage: vi.fn().mockResolvedValue(100),
			historicalPrice: vi.fn().mockResolvedValue({
				datasets: [100, 200],
				labels: ["2024-01-01", "2024-01-02"],
			}),
		}),
	},
}));

describe("ExchangeRateService", () => {
	let exchangeRateService: ExchangeRateService;
	let mockStorage;

	beforeEach(() => {
		mockStorage = {
			get: vi.fn().mockResolvedValue(undefined),
			set: vi.fn().mockResolvedValue(undefined),
		};
		exchangeRateService = new ExchangeRateService({ storage: mockStorage });
		vi.clearAllMocks();
	});

	it("should create exchange rate service", () => {
		expect(exchangeRateService).toBeDefined();
	});

	it("should return 0 for exchange when rate is 0", () => {
		const date = DateTime.make("2024-01-01");
		const result = exchangeRateService.exchange("ARK", "USD", date, 100);
		expect(result).toBe(0);
	});

	it("should snapshot to storage", async () => {
		await expect(exchangeRateService.snapshot()).resolves.not.toThrow();
		expect(mockStorage.set).toHaveBeenCalled();
	});

	it("should restore from storage", async () => {
		mockStorage.get.mockResolvedValue({ "ARK.USD.2024-01-01": 100 });
		await expect(exchangeRateService.restore()).resolves.not.toThrow();
	});

	it("should not restore when entries are undefined", async () => {
		mockStorage.get.mockResolvedValue(undefined);
		await expect(exchangeRateService.restore()).resolves.not.toThrow();
	});

	it("should not restore when entries are null", async () => {
		mockStorage.get.mockResolvedValue(null);
		await expect(exchangeRateService.restore()).resolves.not.toThrow();
	});

	it("should exchange value with rate", () => {
		const date = DateTime.make("2024-01-01");
		exchangeRateService.exchange("ARK", "USD", date, 100);
	});

	it("should sync all without wallets", async () => {
		const mockProfile = {
			settings: () => ({
				get: () => "USD",
			}),
			wallets: () => ({
				values: () => [],
			}),
		};

		await exchangeRateService.syncAll(mockProfile as any, "ARK");
	});
});
