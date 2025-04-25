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
		const datasets = {};
		for (let index = 0; index < this.data.prices.length; index += 24) {
			datasets[this.data.prices[index][0]] = this.data.prices[index][1];
		}

		const datasetValues: number[] = Object.values(datasets);

		return {
			datasets: datasetValues,
			labels: Object.keys(datasets).map((time) => DateTime.make(time).format(options.dateFormat)),
			max: Math.max(...datasetValues),
			min: Math.min(...datasetValues),
		};
	}
}
