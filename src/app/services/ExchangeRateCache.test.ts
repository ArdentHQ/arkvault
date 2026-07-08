import { Contracts } from "@ardenthq/sdk-profiles";
import {
	env,
	getDefaultProfileId,
	getPasswordProtectedProfileId,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
import { ExchangeRateCache } from "./ExchangeRateCache";

const RATE_LIMIT_ERROR = "Rate limit exceeded";

let subject: ExchangeRateCache;
let profile: Contracts.IProfile;

describe("ExchangeRateCache", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		mockProfileWithPublicAndTestNetworks(profile);
	});

	beforeEach(() => {
		subject = new ExchangeRateCache();
		vi.restoreAllMocks();
	});

	afterEach(() => {
		subject.flush();
	});

	it("should sync on first call", async () => {
		const syncAllSpy = vi.spyOn(env.exchangeRates(), "syncAll");

		await subject.syncAll(env, profile, "ARK");

		expect(syncAllSpy).toHaveBeenCalledTimes(1);
	});

	it("should serve cached result on subsequent calls with the same key", async () => {
		const syncAllSpy = vi.spyOn(env.exchangeRates(), "syncAll");

		await subject.syncAll(env, profile, "BTC");
		await subject.syncAll(env, profile, "BTC");
		await subject.syncAll(env, profile, "BTC");

		expect(syncAllSpy).toHaveBeenCalledTimes(1);
	});

	it("should cache per profile and currency", async () => {
		const syncAllSpy = vi.spyOn(env.exchangeRates(), "syncAll");

		const profileB = env.profiles().findById(getPasswordProtectedProfileId());

		await subject.syncAll(env, profile, "ARK");
		await subject.syncAll(env, profile, "BTC");
		await subject.syncAll(env, profileB, "ARK");

		expect(syncAllSpy).toHaveBeenCalledTimes(3);
	});

	it("should flush cached data", async () => {
		const syncAllSpy = vi.spyOn(env.exchangeRates(), "syncAll");

		await subject.syncAll(env, profile, "ARK");
		expect(syncAllSpy).toHaveBeenCalledTimes(1);

		subject.flush();

		await subject.syncAll(env, profile, "ARK");

		expect(syncAllSpy).toHaveBeenCalledTimes(2);
	});

	it("should return cached value on rate-limit error after a prior success", async () => {
		const syncAllSpy = vi.spyOn(env.exchangeRates(), "syncAll");

		await subject.syncAll(env, profile, "BTC");
		expect(syncAllSpy).toHaveBeenCalledTimes(1);

		vi.spyOn(env.exchangeRates(), "syncAll").mockImplementationOnce(() => {
			throw new Error(RATE_LIMIT_ERROR);
		});

		await expect(subject.syncAll(env, profile, "BTC")).resolves.toBeUndefined();
	});

	it("should throw on error when no previous success data exists", async () => {
		vi.spyOn(env.exchangeRates(), "syncAll").mockImplementationOnce(() => {
			throw new Error(RATE_LIMIT_ERROR);
		});

		await expect(subject.syncAll(env, profile, "BTC")).rejects.toThrow(RATE_LIMIT_ERROR);
	});

	it("should throw on error when cache has expired", async () => {
		const syncAllSpy = vi.spyOn(env.exchangeRates(), "syncAll");

		await subject.syncAll(env, profile, "BTC");
		expect(syncAllSpy).toHaveBeenCalledTimes(1);

		subject.flush();

		vi.spyOn(env.exchangeRates(), "syncAll").mockImplementationOnce(() => {
			throw new Error(RATE_LIMIT_ERROR);
		});

		await expect(subject.syncAll(env, profile, "BTC")).rejects.toThrow(RATE_LIMIT_ERROR);
	});
});
