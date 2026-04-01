import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { DateTime } from "@/app/lib/intl";
import { ExchangeRateService } from "./exchange-rate.service";
import { MarketService } from "@/app/lib/markets";
import { IProfile } from "./contracts.js";
import { env, getDefaultProfileId } from "@/utils/testing-library";

vi.mock("@/app/lib/mainsail/http-client.js", () => ({
	HttpClient: vi.fn().mockImplementation(() => ({
		get: vi.fn().mockResolvedValue({ json: () => ({}) }),
	})),
}));

describe("ExchangeRateService", () => {
	let exchangeRateService: ExchangeRateService;
	let mockStorage;
	let profile: IProfile;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		mockStorage = {
			get: vi.fn().mockResolvedValue(undefined),
			set: vi.fn().mockResolvedValue(undefined),
		};
		vi.spyOn(MarketService, "make").mockReturnValue({
			dailyAverage: vi.fn().mockResolvedValue(100),
			historicalPrice: vi.fn().mockResolvedValue({
				datasets: [2, 200],
				labels: ["2024-01-01", "2024-01-02"],
			}),
		});
		exchangeRateService = new ExchangeRateService({ storage: mockStorage });
	});

	afterEach(() => {
		vi.restoreAllMocks();
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
		vi.spyOn(profile.settings(), "get").mockReturnValue("USD");
		vi.spyOn(profile.wallets(), "values").mockReturnValue([]);

		await exchangeRateService.syncAll(profile, "ARK");
	});

	it("should return correct exchange value when rate exists", async () => {
		mockStorage.get.mockResolvedValue({ "ARK.USD.2024-01-01": 2 });
		await exchangeRateService.restore();

		const date = DateTime.make("2024-01-01");
		const result = exchangeRateService.exchange("ARK", "USD", date, 100);
		expect(result).toBe(200);
	});

	it("should return 0 when rate does not exist for date", () => {
		const date = DateTime.make("2024-01-01");
		const result = exchangeRateService.exchange("ARK", "EUR", date, 100);
		expect(result).toBe(0);
	});

	it("should filter out non-live wallets", async () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "currency").mockReturnValue("ARK");
		vi.spyOn(wallet.network(), "isLive").mockReturnValue(false);
		vi.spyOn(profile.settings(), "get").mockReturnValue("USD");
		vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet]);

		await exchangeRateService.syncAll(profile, "ARK");

		expect(mockStorage.set).not.toHaveBeenCalled();
	});

	it("should filter out wallets with different currency", async () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "currency").mockReturnValue("BTC");
		vi.spyOn(wallet.network(), "isLive").mockReturnValue(true);
		vi.spyOn(profile.settings(), "get").mockReturnValue("USD");
		vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet]);

		await exchangeRateService.syncAll(profile, "ARK");

		expect(mockStorage.set).not.toHaveBeenCalled();
	});

	it("should exchange value using string value", () => {
		const date = DateTime.make("2024-01-01");
		const result = exchangeRateService.exchange("ARK", "USD", date, "100");
		expect(result).toBe(0);
	});

	it("should sync all with live wallets", async () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "currency").mockReturnValue("ARK");
		vi.spyOn(wallet.network(), "isLive").mockReturnValue(true);
		vi.spyOn(profile.settings(), "get").mockReturnValue("USD");
		vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet]);

		await exchangeRateService.syncAll(profile, "ARK");

		expect(mockStorage.set).toHaveBeenCalled();
	});

	it("should not fetch historical rates if already cached", async () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "currency").mockReturnValue("ARK");
		vi.spyOn(wallet.network(), "isLive").mockReturnValue(true);
		vi.spyOn(profile.settings(), "get").mockReturnValue("USD");
		vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet]);

		const yesterday = DateTime.make().subDays(1).format("YYYY-MM-DD");
		vi.spyOn(MarketService, "make").mockReturnValue({
			dailyAverage: vi.fn().mockResolvedValue(100),
			historicalPrice: vi.fn().mockResolvedValue({
				datasets: [50, 60],
				labels: [yesterday, "2024-01-02"],
			}),
		} as any);

		await exchangeRateService.syncAll(profile, "ARK");
		await exchangeRateService.syncAll(profile, "ARK");

		expect(mockStorage.set).toHaveBeenCalled();
	});

	it("should return exchange rate for synced data", async () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "currency").mockReturnValue("ARK");
		vi.spyOn(wallet.network(), "isLive").mockReturnValue(true);
		vi.spyOn(profile.settings(), "get").mockReturnValue("USD");
		vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet]);

		await exchangeRateService.syncAll(profile, "ARK");

		const date = DateTime.make("2024-01-01");
		const result = exchangeRateService.exchange("ARK", "USD", date, 100);
		expect(result).toBe(200);
	});
});
