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
	public transform(): MarketDataCollection {
		const result = {};

		for (const value of Object.values(this.data) as any) {
			result[value.TOSYMBOL] = {
				change24h: value.CHANGEPCT24HOUR,
				currency: value.TOSYMBOL,
				date: new Date(value.LASTUPDATE * 1000),
				marketCap: value.MKTCAP,
				price: value.PRICE,
				volume: value.TOTALVOLUME24HTO,
			};
		}

		return result;
	}
}
