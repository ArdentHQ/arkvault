import { Http } from "@/app/lib/mainsail";
import {
	HistoricalData,
	HistoricalPriceOptions,
	HistoricalVolumeOptions,
	MarketDataCollection,
	PriceTracker,
} from "./contracts/index";
import { CoinCap } from "./drivers/coincap";
import { CoinGecko } from "./drivers/coingecko";
import { CryptoCompare } from "./drivers/cryptocompare";

/**
 * Normalises the communication with Market Data Providers.
 *
 * @export
 * @class MarketService
 */
export class MarketService {
	/**
	 * The adapter that is used to retrieve data.
	 *
	 * @type {PriceTracker}
	 * @memberof MarketService
	 */
	#adapter: PriceTracker;

	/**
	 * Creates an instance of MarketService.
	 *
	 * @param {PriceTracker} adapter
	 * @memberof MarketService
	 */
	public constructor(adapter: PriceTracker) {
		this.#adapter = adapter;
	}

	/**
	 * Creates an instance of MarketService.
	 *
	 * @static
	 * @param {string} name
	 * @param {HttpClient} httpClient
	 * @returns {MarketService}
	 * @memberof MarketService
	 */
	public static make(name: string, httpClient: Http.HttpClient): MarketService {
		return new MarketService(
			{
				coincap: new CoinCap(httpClient),
				coingecko: new CoinGecko(httpClient),
				cryptocompare: new CryptoCompare(httpClient),
			}[name.toLowerCase()] as PriceTracker,
		);
	}

	/**
	 * Set the adapter that is used to retrieve data.
	 *
	 * @param {PriceTracker} adapter
	 * @memberof MarketService
	 */
	public setAdapter(adapter: PriceTracker): void {
		this.#adapter = adapter;
	}

	/**
	 * Verify that the given token exists on the market data provider.
	 *
	 * @param {string} token
	 * @returns {Promise<boolean>}
	 * @memberof MarketService
	 */
	public async verifyToken(token: string): Promise<boolean> {
		return this.#adapter.verifyToken(token);
	}

	/**
	 * Returns market data for the given token.
	 *
	 * @param {string} token
	 * @returns {Promise<MarketDataCollection>}
	 * @memberof MarketService
	 */
	public async marketData(token: string): Promise<MarketDataCollection> {
		return this.#adapter.marketData(token);
	}

	/**
	 * Returns historical prices based on the given options.
	 *
	 * @param {HistoricalPriceOptions} options
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalPrice(options: HistoricalPriceOptions): Promise<HistoricalData> {
		return this.#adapter.historicalPrice(options);
	}

	/**
	 * Returns historical prices with a daily interval.
	 *
	 * @param {string} token
	 * @param {string} currency
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalPriceForDay(token: string, currency: string): Promise<HistoricalData> {
		return this.historicalPrice({ currency, dateFormat: "HH:mm", days: 24, token, type: "hour" });
	}

	/**
	 * Returns historical prices with a weekly interval.
	 *
	 * @param {string} token
	 * @param {string} currency
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalPriceForWeek(token: string, currency: string): Promise<HistoricalData> {
		return this.historicalPrice({ currency, dateFormat: "ddd", days: 7, token, type: "day" });
	}

	/**
	 * Returns historical prices with a monthly interval.
	 *
	 * @param {string} token
	 * @param {string} currency
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalPriceForMonth(token: string, currency: string): Promise<HistoricalData> {
		return this.historicalPrice({ currency, dateFormat: "DD", days: 30, token, type: "day" });
	}

	/**
	 * Returns historical prices with a quarterly interval.
	 *
	 * @param {string} token
	 * @param {string} currency
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalPriceForQuarter(token: string, currency: string): Promise<HistoricalData> {
		return this.historicalPrice({ currency, dateFormat: "DD.MM", days: 120, token, type: "day" });
	}

	/**
	 * Returns historical prices with a yearly interval.
	 *
	 * @param {string} token
	 * @param {string} currency
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalPriceForYear(token: string, currency: string): Promise<HistoricalData> {
		return this.historicalPrice({ currency, dateFormat: "DD.MM", days: 365, token, type: "day" });
	}

	/**
	 * Returns historical volumes based on the given options.
	 *
	 * @param {HistoricalVolumeOptions} options
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalVolume(options: HistoricalVolumeOptions): Promise<HistoricalData> {
		return this.#adapter.historicalVolume(options);
	}

	/**
	 * Returns historical volumes with a daily interval.
	 *
	 * @param {string} token
	 * @param {string} currency
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalVolumeForDay(token: string, currency: string): Promise<HistoricalData> {
		return this.historicalVolume({ currency, dateFormat: "HH:mm", days: 24, token, type: "hour" });
	}

	/**
	 * Returns historical volumes with a weekly interval.
	 *
	 * @param {string} token
	 * @param {string} currency
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalVolumeForWeek(token: string, currency: string): Promise<HistoricalData> {
		return this.historicalVolume({ currency, dateFormat: "ddd", days: 7, token, type: "day" });
	}

	/**
	 * Returns historical volumes with a monthly interval.
	 *
	 * @param {string} token
	 * @param {string} currency
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalVolumeForMonth(token: string, currency: string): Promise<HistoricalData> {
		return this.historicalVolume({ currency, dateFormat: "DD", days: 30, token, type: "day" });
	}

	/**
	 * Returns historical volumes with a quarterly interval.
	 *
	 * @param {string} token
	 * @param {string} currency
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalVolumeForQuarter(token: string, currency: string): Promise<HistoricalData> {
		return this.historicalVolume({ currency, dateFormat: "DD.MM", days: 120, token, type: "day" });
	}

	/**
	 * Returns historical volumes with a yearly interval.
	 *
	 * @param {string} token
	 * @param {string} currency
	 * @returns {Promise<HistoricalData>}
	 * @memberof MarketService
	 */
	public async historicalVolumeForYear(token: string, currency: string): Promise<HistoricalData> {
		return this.historicalVolume({ currency, dateFormat: "DD.MM", days: 365, token, type: "day" });
	}

	/**
	 * Returns the daily average price for the given token, currency and time.
	 *
	 * @param {string} token
	 * @param {string} currency
	 * @param {number} timestamp
	 * @returns {Promise<number>}
	 * @memberof MarketService
	 */
	public async dailyAverage(token: string, currency: string, timestamp: number): Promise<number> {
		return this.#adapter.dailyAverage({ currency, timestamp, token });
	}
}
