import { CURRENCIES, DateTime } from "@/app/lib/intl";
import { Http } from "@/app/lib/mainsail";

import {
	CurrentPriceOptions,
	DailyAverageOptions,
	HistoricalData,
	HistoricalPriceOptions,
	HistoricalVolumeOptions,
	MarketDataCollection,
	PriceTracker,
} from "@/app/lib/markets/contracts";
import { HistoricalPriceTransformer } from "./transformers/historical-price-transformer";
import { HistoricalVolumeTransformer } from "./transformers/historical-volume-transformer";
import { MarketTransformer } from "./transformers/market-transformer";

/**
 * Implements a price tracker through the ARK Pricing API.
 *
 * @see https://github.com/ArdentHQ/ark-pricing
 *
 * @export
 * @class PriceTracker
 * @implements {PriceTracker}
 */
export class ArkPricing implements PriceTracker {
	/**
	 * The HTTP client instance.
	 *
	 * @type {HttpClient}
	 * @memberof PriceTracker
	 */
	readonly #httpClient: Http.HttpClient;

	/**
	 * The host of the ARK Pricing API.
	 *
	 * TODO: placeholder until the service is deployed, update once the final host is known.
	 *
	 * @type {string}
	 * @memberof PriceTracker
	 */
	readonly #host: string = "https://pricing.ark.io/api/v1";

	/**
	 * Creates an instance of PriceTracker.
	 *
	 * @param {HttpClient} httpClient
	 * @memberof PriceTracker
	 */
	public constructor(httpClient: Http.HttpClient) {
		this.#httpClient = httpClient;
	}

	/** {@inheritDoc PriceTracker.verifyToken} */
	public async verifyToken(token: string): Promise<boolean> {
		try {
			const body = await this.#get(`coins/${token.toLowerCase()}/price`, this.#currenciesQuery(["USD"]));

			return !!body.data;
		} catch {
			return false;
		}
	}

	/** {@inheritDoc PriceTracker.marketData} */
	public async marketData(token: string): Promise<MarketDataCollection> {
		const body = await this.#get(
			`coins/${token.toLowerCase()}/market`,
			this.#currenciesQuery(Object.keys(CURRENCIES)),
		);

		return new MarketTransformer(body.data ?? {}).transform();
	}

	/** {@inheritDoc PriceTracker.historicalPrice} */
	public async historicalPrice(options: HistoricalPriceOptions): Promise<HistoricalData> {
		const body = await this.#get(`coins/${options.token.toLowerCase()}/history`, {
			currency: options.currency,
			interval: options.type,
			limit: options.days,
		});

		return new HistoricalPriceTransformer(body.data.prices).transform(options);
	}

	/** {@inheritDoc PriceTracker.historicalVolume} */
	public async historicalVolume(options: HistoricalVolumeOptions): Promise<HistoricalData> {
		const body = await this.#get(`coins/${options.token.toLowerCase()}/history`, {
			currency: options.currency,
			interval: options.type,
			limit: options.days,
		});

		return new HistoricalVolumeTransformer(body.data.prices).transform(options);
	}

	/** {@inheritDoc PriceTracker.dailyAverage} */
	public async dailyAverage(options: DailyAverageOptions): Promise<number> {
		const body = await this.#get(`coins/${options.token.toLowerCase()}/average`, {
			currency: options.currency,
			date: DateTime.make(options.timestamp).format("YYYY-MM-DD"),
		});

		return body.data.average;
	}

	/** {@inheritDoc PriceTracker.currentPrice} */
	public async currentPrice(options: CurrentPriceOptions): Promise<number> {
		const body = await this.#get(
			`coins/${options.token.toLowerCase()}/price`,
			this.#currenciesQuery([options.currency]),
		);

		return body.data.prices[options.currency.toUpperCase()].price;
	}

	/**
	 * Builds an indexed query object so the currencies reach the API as an array.
	 *
	 * @private
	 * @param {string[]} currencies
	 * @returns {Record<string, string>}
	 * @memberof PriceTracker
	 */
	#currenciesQuery(currencies: string[]): Record<string, string> {
		const query: Record<string, string> = {};

		for (const [index, currency] of currencies.entries()) {
			query[`currencies[${index}]`] = currency.toUpperCase();
		}

		return query;
	}

	/**
	 * Sends an HTTP GET request to the ARK Pricing API.
	 *
	 * @private
	 * @param {string} path
	 * @param {object} query
	 * @returns {Promise<any>}
	 * @memberof PriceTracker
	 */
	async #get(path: string, query: object): Promise<any> {
		const response = await this.#httpClient.get(`${this.#host}/${path}`, query);

		return response.json();
	}
}
