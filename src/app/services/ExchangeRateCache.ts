import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { Cache } from "./Cache";

const CACHE_TTL = 40; // 40 seconds

export class ExchangeRateCache {
	private readonly cache: Cache;

	public constructor() {
		this.cache = new Cache(CACHE_TTL);
	}

	public async syncAll(env: Environment, profile: Contracts.IProfile, currency: string): Promise<void> {
		const cacheKey = `exchangeRates.syncAll:${profile.id()}:${currency}`;

		try {
			await this.cache.remember(cacheKey, async () => env.exchangeRates().syncAll(profile, currency));
		} catch (error) {
			const cachedValue = this.cache.get(cacheKey);
			if (cachedValue !== undefined) {
				return cachedValue;
			}

			throw error;
		}
	}

	public flush() {
		this.cache.flush();
	}
}

export const exchangeRateCache = new ExchangeRateCache();
