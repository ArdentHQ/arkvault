import { Http } from "@/app/lib/sdk";
import { DateTime } from "@/app/lib/intl";

import {
	CurrentPriceOptions,
	DailyAverageOptions,
	HistoricalData,
	HistoricalPriceOptions,
	MarketDataCollection,
	PriceTracker,
} from "@/app/lib/markets/contracts";
import { HistoricalPriceTransformer } from "./transformers/historical-price-transformer";
import { MarketTransformer } from "./transformers/market-transformer";

/**
 * Implements a price tracker through the CoinCap API.
 *
 * @see https://docs.coincap.io/
 *
 * @export
 * @class PriceTracker
 * @implements {PriceTracker}
 */
export class CoinCap implements PriceTracker {
	/**
	 * The cache that holds the remote token identifiers.
	 *
	 * @private
	 * @type {Record<string, any>}
	 * @memberof PriceTracker
	 */
	private readonly tokenLookup: Record<string, any> = {};

	/**
	 * The HTTP client instance.
	 *
	 * @type {HttpClient}
	 * @memberof PriceTracker
	 */
	readonly #httpClient: Http.HttpClient;

	/**
	 * The host of the CoinCap API.
	 *
	 * @type {string}
	 * @memberof PriceTracker
	 */
	readonly #host: string = "https://api.coincap.io/v2";

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
			const tokenData = await this.#fetchTokenData(token);

			return !!tokenData.id;
		} catch {
			return false;
		}
	}

	/** {@inheritDoc PriceTracker.marketData} */
	public async marketData(token: string): Promise<MarketDataCollection> {
		const tokenId = await this.#getTokenId(token);

		if (!tokenId) {
			throw new Error("Failed to determine the token.");
		}

		const response = await this.#getCurrencyData(token);

		return new MarketTransformer(response).transform({ token: tokenId });
	}

	/** {@inheritDoc PriceTracker.historicalPrice} */
	public async historicalPrice(options: HistoricalPriceOptions): Promise<HistoricalData> {
		const tokenId = await this.#getTokenId(options.token);

		const { rates } = await this.#getCurrencyData(options.token);
		const daysSubtract = options.days === 24 ? 1 : options.days;
		const timeInterval = options.days === 24 ? "h1" : "h12";
		const startDate = DateTime.make().subDays(daysSubtract).valueOf();
		const endDate = DateTime.make().valueOf();
		const body = await this.#get(`assets/${tokenId}/history`, {
			end: endDate,
			interval: timeInterval,
			start: startDate,
		});

		return new HistoricalPriceTransformer(body.data).transform({
			currency: options.currency,
			dateFormat: options.dateFormat,
			rates,
			token: tokenId,
		});
	}

	/** {@inheritDoc PriceTracker.historicalVolume} */
	// eslint-disable-next-line @typescript-eslint/require-await
	public async historicalVolume(): Promise<HistoricalData> {
		throw new Error(`Method ${this.constructor.name}#${this.historicalVolume.name} is not implemented.`);
	}

	/** {@inheritDoc PriceTracker.dailyAverage} */
	public async dailyAverage(options: DailyAverageOptions): Promise<number> {
		const tokenId = await this.#getTokenId(options.token);

		const start = DateTime.make(options.timestamp).startOf("day").valueOf();
		const end = DateTime.make(start).addDay().valueOf();

		const response = await this.#get(`assets/${tokenId}/history`, {
			end,
			interval: "h1",
			start,
		});

		if (response.data.length === 0) {
			return 0;
		}

		const priceUsd = response.data.reduce((acc, data) => acc + Number(data.priceUsd), 0) / response.data.length;

		const { data } = await this.#get("rates");

		return priceUsd / Number(data.find((rate: any) => rate.symbol === options.currency.toUpperCase()).rateUsd);
	}

	/** {@inheritDoc PriceTracker.currentPrice} */
	public async currentPrice(options: CurrentPriceOptions): Promise<number> {
		return this.dailyAverage({
			...options,
			timestamp: Date.now(),
		});
	}

	/**
	 * Returns and/or caches the remote token identifier.
	 *
	 * @private
	 * @param {string} token
	 * @param {number} [limit=1000]
	 * @returns {Promise<string>}
	 * @memberof PriceTracker
	 */
	async #getTokenId(token: string, limit = 1000): Promise<string> {
		if (Object.keys(this.tokenLookup).length > 0) {
			return this.tokenLookup[token.toUpperCase()];
		}

		const body = await this.#get("assets", { limit });

		for (const value of Object.values(body.data)) {
			// @ts-ignore
			this.tokenLookup[value.symbol.toUpperCase()] = value.id;
		}

		return this.tokenLookup[token.toUpperCase()];
	}

	/**
	 * Returns information about the given token.
	 *
	 * @private
	 * @param {string} token
	 * @returns {Promise<Record<string, any>>}
	 * @memberof PriceTracker
	 */
	async #fetchTokenData(token: string): Promise<Record<string, any>> {
		const tokenId = await this.#getTokenId(token);

		const body = await this.#get(`assets/${tokenId}`);

		return body.data;
	}

	/**
	 * Returns information about the available rates for the given token.
	 *
	 * @private
	 * @param {string} token
	 * @returns {Promise<Record<string, any>>}
	 * @memberof PriceTracker
	 */
	async #getCurrencyData(token: string): Promise<Record<string, any>> {
		const body = await this.#get("rates");
		const { data, timestamp } = body;
		const tokenData = await this.#fetchTokenData(token);

		const response = {
			assets: { [tokenData.symbol.toUpperCase()]: tokenData },
			rates: { [tokenData.symbol.toUpperCase()]: tokenData.priceUsd },
			timestamp,
		};

		for (const value of data) {
			response.assets[value.symbol.toUpperCase()] = value;
			response.rates[value.symbol.toUpperCase()] = value.rateUsd;
		}

		return response;
	}

	/**
	 * Sends an HTTP GET request to the CoinCap API.
	 *
	 * @private
	 * @param {string} path
	 * @param {*} [query={}]
	 * @returns {Promise<any>}
	 * @memberof PriceTracker
	 */
	async #get(path: string, query = {}): Promise<any> {
		const response = await this.#httpClient.get(`${this.#host}/${path}`, query);

		return response.json();
	}
}
