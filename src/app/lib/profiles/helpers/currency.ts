import { BigNumber } from "@ardenthq/sdk-helpers";
import { CURRENCIES, Money, Numeral } from "@ardenthq/sdk-intl";

interface CurrencyFormatOptions {
	locale?: string;
	withTicker?: boolean;
}

const DEFAULT_DECIMALS = 8;

export class Currency {
	public static format(value: number, ticker: string, options: CurrencyFormatOptions = {}): string {
		const withTicker = options.withTicker ?? true;
		const decimals = CURRENCIES[ticker]?.decimals ?? DEFAULT_DECIMALS;

		if (decimals > 2) {
			const numeral = Numeral.make(options.locale, {
				currencyDisplay: "name",
				maximumFractionDigits: decimals,
				minimumFractionDigits: 0,
			});

			// Intl.NumberFormat throws error for some tickers like DARK
			// so format as BTC then replace
			return numeral
				.formatAsCurrency(Math.abs(value), "BTC")
				.replace("BTC", withTicker ? ticker.toUpperCase() : "")
				.trim();
		}

		let money =
			decimals === 2
				? Money.make(Math.round(BigNumber.make(Math.abs(value)).times(100).toNumber()), ticker)
				: Money.make(BigNumber.make(Math.abs(value)).times(100).decimalPlaces(0).toNumber(), ticker);

		if (options.locale) {
			money = money.setLocale(options.locale);
		}

		if (!withTicker) {
			return money
				.format()
				.replace(/[^\d,.]/g, "")
				.trim();
		}

		return money.format();
	}
}
