import { Coins } from "@ardenthq/sdk";

/**
 * Defines the structure that represents a portfolio entry.
 *
 * @export
 * @interface IPortfolioEntry
 */
export interface IPortfolioEntry {
	coin: Coins.Coin;
	source: number;
	target: number;
	shares: number;
}

/**
 * Defines the structure of options for the portfolio breakdown.
 *
 * @export
 * @interface IPortfolioBreakdownOptions
 */
export interface IPortfolioBreakdownOptions {
	networkIds?: string[];
}

/**
 * Defines the implementation contract for the portfolio service.
 *
 * @export
 * @interface IPortfolio
 */
export interface IPortfolio {
	/**
	 * Calculates a breakdown of all coins in the profile.
	 *
	 * @return {IPortfolioEntry[]}
	 * @memberof IPortfolio
	 */
	breakdown(options?: IPortfolioBreakdownOptions): IPortfolioEntry[];
}
