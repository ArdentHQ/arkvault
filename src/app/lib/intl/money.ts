import {
	Dinero,
	DineroCurrency,
	add,
	allocate,
	dinero,
	equal,
	greaterThan,
	greaterThanOrEqual,
	isNegative,
	isPositive,
	lessThan,
	lessThanOrEqual,
	multiply,
	subtract,
	toDecimal,
	toSnapshot,
} from "dinero.js";
import * as allCurrencies from "dinero.js/currencies";

const currencyMap = allCurrencies as unknown as Record<string, DineroCurrency<number>>;

function getCurrencyObject(code: string): DineroCurrency<number> {
	const currency = currencyMap[code];
	if (!currency) {
		throw new Error(`Unknown currency code: ${code}`);
	}
	return currency;
}

/**
 * Simplifies working with monetary values through Dinero.js
 *
 * @see https://dinerojs.com/
 *
 * @export
 * @class Money
 */
export class Money {
	readonly #value: Dinero<number>;
	readonly #currency: string;
	readonly #locale: string;
	readonly #formatter: Intl.NumberFormat;

	private constructor(options: { amount: number; currency: string; locale?: string; scale?: number }) {
		this.#value = dinero({
			amount: options.amount,
			currency: getCurrencyObject(options.currency),
			...(options.scale !== undefined ? { scale: options.scale } : {}),
		});
		this.#currency = options.currency;
		this.#locale = options.locale ?? "en-US";

		const { scale } = toSnapshot(this.#value);
		this.#formatter = new Intl.NumberFormat(this.#locale, {
			currency: this.#currency,
			maximumFractionDigits: scale as number,
			minimumFractionDigits: scale as number,
			style: "currency",
		});
	}

	public static make(amount: number, currency: string): Money {
		return new Money({ amount, currency });
	}

	private static fromDinero(value: Dinero<number>, currency: string): Money {
		const { amount, scale } = toSnapshot(value);
		return new Money({ amount: amount as number, currency, scale: scale as number });
	}

	public setLocale(locale: string): Money {
		const snapshot = toSnapshot(this.#value);
		return new Money({
			amount: snapshot.amount as number,
			currency: this.#currency,
			locale,
			scale: snapshot.scale as number,
		});
	}

	public plus(value: Money): Money {
		return Money.fromDinero(add(this.#value, value.#value), this.#currency);
	}

	public minus(value: Money): Money {
		return Money.fromDinero(subtract(this.#value, value.#value), this.#currency);
	}

	public times(value: number): Money {
		return Money.fromDinero(multiply(this.#value, value), this.#currency);
	}

	public divide(value: number): Money {
		if (!Number.isInteger(value) || value === 0) {
			throw new TypeError("The divisor must be a non-zero integer.");
		}
		return Money.fromDinero(allocate(this.#value, Array.from({ length: value }, () => 1))[0], this.#currency);
	}

	public isEqualTo(value: Money): boolean {
		return equal(this.#value, value.#value);
	}

	public isLessThan(value: Money): boolean {
		return lessThan(this.#value, value.#value);
	}

	public isLessThanOrEqual(value: Money): boolean {
		return lessThanOrEqual(this.#value, value.#value);
	}

	public isGreaterThan(value: Money): boolean {
		return greaterThan(this.#value, value.#value);
	}

	public isGreaterThanOrEqual(value: Money): boolean {
		return greaterThanOrEqual(this.#value, value.#value);
	}

	public isPositive(): boolean {
		return isPositive(this.#value);
	}

	public isNegative(): boolean {
		return isNegative(this.#value);
	}

	public getAmount(): number {
		return toSnapshot(this.#value).amount as number;
	}

	public getCurrency(): string {
		return toSnapshot(this.#value).currency.code;
	}

	public format(): string {
		return this.#formatter.format(toDecimal(this.#value) as unknown as number);
	}

	public toUnit(): number {
		return Number.parseFloat(toDecimal(this.#value));
	}
}
