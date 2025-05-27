import { NumberLike } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { MarketService } from "@/app/lib/markets";

import { IExchangeRateService, IProfile, IReadWriteWallet, ProfileSetting } from "./contracts.js";
import { DataRepository } from "./data.repository";
import { Storage } from "./environment.models.js";
import { HttpClient } from "@/app/lib/mainsail/http-client.js";

export class ExchangeRateService implements IExchangeRateService {
	readonly #storageKey: string = "EXCHANGE_RATE_SERVICE";
	readonly #dataRepository: DataRepository = new DataRepository();
	readonly #httpClient: HttpClient;
	readonly #storage: Storage;

	public constructor({ storage }: { storage: Storage }) {
		this.#httpClient = new HttpClient(10_000);
		this.#storage = storage;
	}

	/** {@inheritDoc IExchangeRateService.syncAll} */
	public async syncAll(profile: IProfile, currency: string): Promise<void> {
		const wallets: IReadWriteWallet[] = profile
			.wallets()
			.values()
			.filter((wallet: IReadWriteWallet) => wallet.currency() === currency && wallet.network().isLive());

		if (wallets.length === 0) {
			return;
		}

		const exchangeCurrency: string = profile.settings().get(ProfileSetting.ExchangeCurrency) as string;

		await this.#fetchDailyRate(profile, currency, exchangeCurrency);

		/* istanbul ignore next */
		if (this.#hasFetchedHistoricalRates(currency, exchangeCurrency)) {
			return;
		}

		const historicalRates = await MarketService.make(
			profile.settings().get(ProfileSetting.MarketProvider) as string,
			this.#httpClient,
		).historicalPrice({
			currency: exchangeCurrency,
			dateFormat: "YYYY-MM-DD",
			days: 2000,
			token: currency,
			// @TODO: this might cause issues with certain providers. Should allow for an "all" option to aggregate all pages without knowing the specific number
			type: "day",
		});

		for (let index = 0; index < historicalRates.labels.length; index++) {
			this.#dataRepository.set(
				`${currency}.${exchangeCurrency}.${historicalRates.labels[index]}`,
				historicalRates.datasets[index],
			);
		}

		await this.snapshot();
	}

	/** {@inheritDoc IExchangeRateService.exchange} */
	public exchange(currency: string, exchangeCurrency: string, date: DateTime, value: NumberLike): number {
		const exchangeRate: number =
			this.#dataRepository.get(`${currency}.${exchangeCurrency}.${date.format("YYYY-MM-DD")}`) || 0;

		if (exchangeRate === 0) {
			return 0;
		}

		return +value.toString() * exchangeRate;
	}

	/** {@inheritDoc IExchangeRateService.snapshot} */
	public async snapshot(): Promise<void> {
		await this.#storage.set(this.#storageKey, this.#dataRepository.all());
	}

	/** {@inheritDoc IExchangeRateService.restore} */
	public async restore(): Promise<void> {
		const entries: object | undefined | null = await this.#storage.get(this.#storageKey);

		if (entries !== undefined && entries !== null) {
			this.#dataRepository.fill(entries);
		}
	}

	#hasFetchedHistoricalRates(currency: string, exchangeCurrency: string): boolean {
		const yesterday = DateTime.make().subDays(1).format("YYYY-MM-DD");

		return this.#dataRepository.has(`${currency}.${exchangeCurrency}.${yesterday}`);
	}

	async #fetchDailyRate(profile: IProfile, currency: string, exchangeCurrency: string): Promise<void> {
		this.#dataRepository.set(
			`${currency}.${exchangeCurrency}.${DateTime.make().format("YYYY-MM-DD")}`,
			await MarketService.make(
				profile.settings().get(ProfileSetting.MarketProvider) as string,
				this.#httpClient,
			).dailyAverage(currency, exchangeCurrency, +Date.now()),
		);
	}
}
