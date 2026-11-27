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
	 * @returns {MarketDataCollection}
	 * @memberof MarketTransformer
	 */
	public transform(): MarketDataCollection {
		const result = {};

		for (const [currency, value] of Object.entries(this.data) as any) {
			if (currency === "coin") {
				continue;
			}

			result[currency] = {
				change24h: value.change24h,
				currency,
				date: new Date(value.timestamp),
				marketCap: value.marketCap,
				price: value.price,
				volume: value.volume,
			};
		}

		return result;
	}
}
