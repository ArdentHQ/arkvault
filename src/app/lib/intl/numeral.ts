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

	/**
	 * Formats a value in compact form with a suffix.
	 *
	 * Example: 1500 should return { value: 1.5, suffix: 'K' }
	 *
	 * @param {BigNumber | number | string} value
	 * @returns { value: number; suffix: string | undefined }
	 */
	public formatCompact(value: BigNumber | string | number): { value: number; suffix: string | undefined } {
		const bnValue = BigNumber.make(value);

		const scales: Array<{ exp: number; suffix: string }> = [
			{ exp: 63, suffix: "Vg" }, // Vigintillion
			{ exp: 60, suffix: "Nod" }, // Novemdecillion
			{ exp: 57, suffix: "Ocd" }, // Octodecillion
			{ exp: 54, suffix: "Spd" }, // Septendecillion
			{ exp: 51, suffix: "Sxd" }, // Sexdecillion
			{ exp: 48, suffix: "Qid" }, // Quindecillion
			{ exp: 45, suffix: "Qad" }, // Quattuordecillion
			{ exp: 42, suffix: "Td" }, // Tredecillion
			{ exp: 39, suffix: "Dd" }, // Duodecillion
			{ exp: 36, suffix: "Ud" }, // Undecillion
			{ exp: 33, suffix: "Dc" }, // Decillion
			{ exp: 30, suffix: "No" }, // Nonillion
			{ exp: 27, suffix: "Oc" }, // Octillion
			{ exp: 24, suffix: "Sp" }, // Septillion
			{ exp: 21, suffix: "Sx" }, // Sextillion
			{ exp: 18, suffix: "Qi" }, // Quintillion
			{ exp: 15, suffix: "Qa" }, // Quadrillion
			{ exp: 12, suffix: "T" }, // Trillion
			{ exp: 9, suffix: "B" }, // Billion
			{ exp: 6, suffix: "M" }, // Million
			{ exp: 3, suffix: "K" }, // Thousand
		];

		for (const { exp, suffix } of scales) {
			const threshold = BigNumber.powerOfTen(exp);
			if (bnValue.isGreaterThanOrEqualTo(threshold)) {
				const scaled = bnValue.divide(threshold);
				return { suffix, value: scaled.toNumber() };
			}
		}

		return { suffix: undefined, value: bnValue.toNumber() };
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
