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
 * Implements a price tracker through the CryptoCompare API.
 *
 * @see https://min-api.cryptocompare.com/
 *
 * @export
 * @class PriceTracker
 * @implements {PriceTracker}
 */
export class CryptoCompare implements PriceTracker {
	/**
	 * The HTTP client instance.
	 *
	 * @type {HttpClient}
	 * @memberof PriceTracker
	 */
	readonly #httpClient: Http.HttpClient;

	/**
	 * The host of the CryptoCompare API.
	 *
	 * @type {string}
	 * @memberof PriceTracker
	 */
	readonly #host: string = "https://min-api.cryptocompare.com";

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
			const body = await this.#get("data/price", {
				fsym: token,
				tsyms: "BTC",
			});

			return !!body.BTC;
		} catch {
			return false;
		}
	}

	/** {@inheritDoc PriceTracker.marketData} */
	public async marketData(token: string): Promise<MarketDataCollection> {
		const body = await this.#get("data/pricemultifull", {
			fsyms: token,
			tsyms: Object.keys(CURRENCIES).join(","),
		});

		return new MarketTransformer(body.RAW && body.RAW[token] ? body.RAW[token] : {}).transform();
	}

	/** {@inheritDoc PriceTracker.historicalPrice} */
	public async historicalPrice(options: HistoricalPriceOptions): Promise<HistoricalData> {
		const body = await this.#get(`data/v2/histo${options.type}`, {
			fsym: options.token,
			limit: options.days,
			toTs: Math.round(Date.now() / 1000),
			tsym: options.currency,
		});

		return new HistoricalPriceTransformer(body.Data.Data).transform(options);
	}

	/** {@inheritDoc PriceTracker.historicalVolume} */
	public async historicalVolume(options: HistoricalVolumeOptions): Promise<HistoricalData> {
		const body = await this.#get(`data/v2/histo${options.type}`, {
			fsym: options.token,
			limit: options.days,
			toTs: Math.round(Date.now() / 1000),
			tsym: options.currency,
		});

		return new HistoricalVolumeTransformer(body.Data.Data).transform(options);
	}

	/** {@inheritDoc PriceTracker.dailyAverage} */
	public async dailyAverage(options: DailyAverageOptions): Promise<number> {
		const response = await this.#get(`data/dayAvg`, {
			fsym: options.token,
			toTs: DateTime.make(options.timestamp).toUNIX(),
			tsym: options.currency,
		});

		return response[options.currency.toUpperCase()];
	}

	/** {@inheritDoc PriceTracker.currentPrice} */
	public async currentPrice(options: CurrentPriceOptions): Promise<number> {
		const body = await this.#get("data/price", {
			fsym: options.token,
			tsyms: options.currency,
		});

		return body[options.currency];
	}

	/**
	 * Sends an HTTP GET request to the CryptoCompare API.
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
