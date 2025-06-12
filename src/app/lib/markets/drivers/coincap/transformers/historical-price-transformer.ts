import { DateTime } from "@/app/lib/intl";
import { convertToCurrency } from "@/app/lib/markets/drivers/coincap/utils";
import { HistoricalData, HistoricalTransformer } from "@/app/lib/markets/contracts";

/**
 * Implements a transformer for historical volume data.
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
		const { token, currency, rates, dateFormat } = options;

		const tokenId = token.toUpperCase();
		const datasets = {};

		for (const value of Object.values(this.data)) {
			datasets[DateTime.make(value.time).format(dateFormat)] = convertToCurrency(value.priceUsd, {
				base: tokenId,
				from: currency,
				rates,
				to: tokenId,
			});
		}

		const datasetValues: number[] = Object.values(datasets);

		return {
			datasets: datasetValues,
			labels: Object.keys(datasets).map((time) => DateTime.make(time).format(dateFormat)),
			max: Math.max(...datasetValues),
			min: Math.min(...datasetValues),
		};
	}
}
