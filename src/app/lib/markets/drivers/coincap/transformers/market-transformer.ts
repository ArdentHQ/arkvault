import { CURRENCIES } from "@/app/lib/intl";
import { convertToCurrency } from "@/app/lib/markets/drivers/coincap/utils";
import { MarketDataCollection } from "@/app/lib/markets/contracts";

/**
 * Implements a transformer for historical market data.
 *
 * @export
 * @class MarketTransformer
 * @implements {MarketTransformer}
 */
export class MarketTransformer implements MarketTransformer {
	// All prices on the CoinCap API are standardized in USD (United States Dollar)
	/**
	 *
	 *
	 * @private
	 * @type {string}
	 * @memberof MarketTransformer
	 */
	private readonly baseCurrency: string = "USD";

	/**
	 * Creates an instance of MarketTransformer.
	 *
	 * @param {Record<string, any>} data
	 * @memberof MarketTransformer
	 */
	public constructor(private readonly data: Record<string, any>) {}

	/**
	 * Transforms the given data into a normalised format.
	 *
	 * @param {Record<string, any>} options
	 * @returns {MarketDataCollection}
	 * @memberof MarketTransformer
	 */
	public transform(options: Record<string, any>): MarketDataCollection {
		const tokenId = options.token.toUpperCase();
		const result = {};

		for (const currency of Object.keys(options.currencies || CURRENCIES)) {
			const { assets, rates } = this.data;

			if (!assets[currency]) {
				continue;
			}

			const { timestamp } = this.data;

			result[currency] = {
				change24h: null,
				currency,
				date: new Date(timestamp),
				marketCap: this.#normalise(assets[tokenId].marketCapUsd, rates, currency),
				price: convertToCurrency(1, {
					base: this.baseCurrency,
					from: currency,
					rates,
					to: tokenId,
				}),
				volume: this.#normalise(assets[tokenId].volumeUsd24Hr, rates, currency),
			};
		}

		return result;
	}

	#normalise(marketCapUsd: number, rates: object, currency: string): number {
		return marketCapUsd * (rates[this.baseCurrency] / rates[currency]);
	}
}
