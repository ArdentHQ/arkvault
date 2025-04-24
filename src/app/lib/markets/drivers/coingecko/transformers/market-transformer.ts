import { CURRENCIES } from "@/app/lib/intl";
import { MarketDataCollection } from "@/app/lib/markets/contracts";

/**
 * Implements a transformer for historical market data.
 *
 * @export
 * @class MarketTransformer
 * @implements {MarketTransformer}
 */
export class MarketTransformer implements MarketTransformer {
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
		const result = {};

		for (const currency of Object.keys(options.currencies || CURRENCIES)) {
			const currencyLowerCase = currency.toLowerCase();

			if (!this.data.current_price[currencyLowerCase]) {
				continue;
			}

			result[currency] = {
				change24h: this.data.market_cap_change_percentage_24h_in_currency[currencyLowerCase],
				currency,
				date: new Date(this.data.last_updated),
				marketCap: this.data.market_cap[currencyLowerCase],
				price: this.data.current_price[currencyLowerCase],
				volume: this.data.total_volume[currencyLowerCase],
			};
		}

		return result;
	}
}
