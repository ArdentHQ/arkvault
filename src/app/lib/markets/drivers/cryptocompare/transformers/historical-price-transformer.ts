import { DateTime } from "@/app/lib/intl";
import { HistoricalData, HistoricalTransformer } from "@/app/lib/markets/contracts";

/**
 * Implements a transformer for historical price data.
 *
 * @export
 * @class HistoricalPriceTransformer
 * @implements {HistoricalTransformer}
 */
export class HistoricalPriceTransformer implements HistoricalTransformer {
	/**
	 * Creates an instance of HistoricalPriceTransformer.
	 *
	 * @param {Record<string, any>} data
	 * @memberof HistoricalPriceTransformer
	 */
	public constructor(private readonly data: Record<string, any>) {}

	/**
	 * Transforms the given data into a normalised format.
	 *
	 * @param {Record<string, any>} options
	 * @returns {HistoricalData}
	 * @memberof HistoricalPriceTransformer
	 */
	public transform(options: Record<string, any>): HistoricalData {
		const datasets = this.data.map((value) => value.close);

		return {
			datasets,
			labels: this.data.map((value) => DateTime.make(value.time * 1000).format(options.dateFormat)),
			max: Math.max(...datasets),
			min: Math.min(...datasets),
		};
	}
}
