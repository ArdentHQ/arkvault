import { BigNumber } from "@/app/lib/helpers";

/**
 * Implements helpers for numerical formatting with currencies and unit.
 *
 * @export
 * @class Numeral
 */
export class Numeral {
	/**
	 * The locale that will be used for formatting.
	 *
	 * @type {string | undefined}
	 * @memberof Numeral
	 */
	readonly #locale: string | undefined;

	/**
	 * The options that should be used for formatting.
	 *
	 * @type {Intl.NumberFormatOptions}
	 * @memberof Numeral
	 */
	readonly #options: Intl.NumberFormatOptions;

	/**
	 * Creates an instance of Numeral.
	 *
	 * @param {string | undefined} locale
	 * @param {Intl.NumberFormatOptions} [options]
	 * @memberof Numeral
	 */
	private constructor(locale: string | undefined, options?: Intl.NumberFormatOptions) {
		this.#locale = locale;
		this.#options = options || {};
	}

	/**
	 * Creates an instance of Numeral.
	 *
	 * @static
	 * @param {string | undefined} locale
	 * @param {Intl.NumberFormatOptions} [options]
	 * @returns {Numeral}
	 * @memberof Numeral
	 */
	public static make(locale: string | undefined, options?: Intl.NumberFormatOptions): Numeral {
		return new Numeral(locale, options);
	}

	/**
	 * Returns the formatted value.
	 *
	 * @param {number} value
	 * @returns {string}
	 * @memberof Numeral
	 */
	public format(value: number): string {
		return new Intl.NumberFormat(this.#locale).format(value);
	}

	/**
	 * Returns the formatted value with the given currency as suffix.
	 *
	 * @param {number} value
	 * @param {string} currency
	 * @returns {string}
	 * @memberof Numeral
	 */
	public formatAsCurrency(value: number, currency: string): string {
		return new Intl.NumberFormat(this.#locale, {
			...this.#options,
			currency,
			style: "currency",
		}).format(value);
	}

	public formatCompact(value: BigNumber | string | number): { value: number; suffix: string | undefined } {
		const bnValue = BigNumber.make(value);

		const scales: Array<{ exp: number; suffix: string }> = [
			{ exp: 33, suffix: "De" },
			{ exp: 30, suffix: "No" },
			{ exp: 27, suffix: "Oc" },
			{ exp: 24, suffix: "Sp" },
			{ exp: 21, suffix: "Sx" },
			{ exp: 18, suffix: "Qi" },
			{ exp: 15, suffix: "Qa" },
			{ exp: 12, suffix: "T" },
			{ exp: 9, suffix: "B" },
			{ exp: 6, suffix: "M" },
			{ exp: 3, suffix: "K" },
		];

		for (const { exp, suffix } of scales) {
			const threshold = BigNumber.powerOfTen(exp);
			if (bnValue.isGreaterThanOrEqualTo(threshold)) {
				const scaled = bnValue.divide(threshold);
				return { value: scaled.toNumber(), suffix };
			}
		}

		return { value: bnValue.toNumber(), suffix: undefined };
	}

	/**
	 * Returns the formatted value with the given unit as suffix.
	 *
	 * @param {number} value
	 * @param {string} unit
	 * @returns {string}
	 * @memberof Numeral
	 */
	public formatAsUnit(value: number, unit: string): string {
		return new Intl.NumberFormat(this.#locale, {
			...this.#options,
			style: "unit",
			unit,
		}).format(value);
	}
}
