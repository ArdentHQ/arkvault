import { NumberLike } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import { MarketService } from "@ardenthq/sdk-markets";

import { container } from "./container.js";
import { Identifiers } from "./container.models.js";
import { IExchangeRateService, IProfile, IReadWriteWallet, ProfileSetting } from "./contracts.js";
import { DataRepository } from "./data.repository";
import { Storage } from "./environment.models.js";

export class ExchangeRateService implements IExchangeRateService {
	readonly #storageKey: string = "EXCHANGE_RATE_SERVICE";
	readonly #dataRepository: DataRepository = new DataRepository();

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
			container.get(Identifiers.HttpClient),
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
		await container.get<Storage>(Identifiers.Storage).set(this.#storageKey, this.#dataRepository.all());
	}

	/** {@inheritDoc IExchangeRateService.restore} */
	public async restore(): Promise<void> {
		const entries: object | undefined | null = await container
			.get<Storage>(Identifiers.Storage)
			.get(this.#storageKey);

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
				container.get(Identifiers.HttpClient),
			).dailyAverage(currency, exchangeCurrency, +Date.now()),
		);
	}
}
