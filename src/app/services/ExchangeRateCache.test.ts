import { Contracts } from "@ardenthq/sdk-profiles";
import {
	env,
	getDefaultProfileId,
	getPasswordProtectedProfileId,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";
import { ExchangeRateCache } from "./ExchangeRateCache";

let subject: ExchangeRateCache;
let profile: Contracts.IProfile;

describe("ExchangeRateCache", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		mockProfileWithPublicAndTestNetworks(profile);
	});

	beforeEach(() => {
		subject = new ExchangeRateCache();
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
});
