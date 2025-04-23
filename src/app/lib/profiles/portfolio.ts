import { IPortfolio, IPortfolioBreakdownOptions, IPortfolioEntry, IProfile } from "./contracts.js";

export class Portfolio implements IPortfolio {
	readonly #profile: IProfile;

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IPortfolio.breakdown} */
	public breakdown(options: IPortfolioBreakdownOptions = {}): IPortfolioEntry[] {
		const result: Record<string, IPortfolioEntry> = {};

		for (const wallet of this.#profile.wallets().values()) {
			if (wallet.network().isTest()) {
				continue;
			}

			if (options.networkIds && !options.networkIds.includes(wallet.networkId())) {
				continue;
			}

			const ticker: string = wallet.network().ticker();

			if (result[ticker] === undefined) {
				result[ticker] = {
					coin: wallet.coin(),
					shares: 0,
					source: 0,
					target: 0,
				};
			}

			result[ticker].source += wallet.balance("total");
			result[ticker].target += wallet.convertedBalance("total");
		}

		let totalValue = 0;

		// Sum
		for (const item of Object.values(result)) {
			totalValue += item.target;
		}

		// Percentages
		for (const item of Object.values(result)) {
			item.shares += (item.target * 100) / totalValue;
		}

		return Object.values(result);
	}
}
