import { BigNumber } from "@/app/lib/helpers";
import { CURRENCIES, Money, Numeral } from "@/app/lib/intl";

interface CurrencyFormatOptions {
	locale?: string;
	withTicker?: boolean;
	decimals?: number;
}

interface CompactFormatOptions extends CurrencyFormatOptions {
	compactDecimals?: number;
}

const DEFAULT_DECIMALS = 18;

export class Currency {
	public static format(value: number | string, ticker: string, options: CurrencyFormatOptions = {}): string {
		const withTicker = options.withTicker ?? true;
		const currencyDecimals = CURRENCIES[ticker]?.decimals ?? DEFAULT_DECIMALS;
		const decimals = options?.decimals ?? currencyDecimals;

		const valueBigNumber = BigNumber.make(value);
		const absValue = valueBigNumber.isNegative() ? valueBigNumber.times(-1) : valueBigNumber;

		if (currencyDecimals > 2) {
			const numeral = Numeral.make(options.locale, {
				currencyDisplay: "name",
				maximumFractionDigits: decimals,
				minimumFractionDigits: 0,
			});

			return numeral
				.formatAsCurrency(absValue.toString() as Intl.StringNumericLiteral, "BTC")
				.replace("BTC", withTicker ? ticker.toUpperCase() : "")
				.trim();
		}

		let money =
			decimals === 2
				? Money.make(Math.round(absValue.times(100).toNumber()), ticker)
				: Money.make(absValue.times(100).decimalPlaces(0).toNumber(), ticker);

		if (options.locale) {
			money = money.setLocale(options.locale);
		}

		if (!withTicker) {
			return money
				.format()
				.replaceAll(/[^\d,.]/g, "")
				.trim();
		}

		return money.format();
	}

	public static formatCompact(
		value: BigNumber | number | string,
		ticker: string,
		options: CompactFormatOptions = {},
	): string {
		const withTicker = options.withTicker ?? true;
		const compactDecimals = options.compactDecimals ?? 2;

		const numeral = Numeral.make(options.locale);
		const { value: scaledValue, suffix } = numeral.formatCompact(value);

		const formatted = Currency.format(scaledValue, ticker, {
			...options,
			decimals: compactDecimals,
			withTicker: false,
		});

		if (!suffix) {
			// No abbreviation is needed. Use normal format with ticker.
			return Currency.format(scaledValue, ticker, options);
		}

		return withTicker ? `${formatted}${suffix} ${ticker.toUpperCase()}` : `${formatted}${suffix}`;
	}
}
