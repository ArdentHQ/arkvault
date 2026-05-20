import Dinero from "dinero.js";
import { describe, expect, it } from "vitest";
import { Money } from "./money";

const amount = 1000;
const currency = "USD";

describe("Money", () => {
	it("should make an instance of Money", () => {
		const money = Money.make(Dinero({ amount, currency }), currency);
		expect(money).toBeInstanceOf(Money);
		expect(money.getAmount()).toBe(amount);
		expect(money.getCurrency()).toBe(currency);
	});

	it("should make an instance of Money from a number", () => {
		const money = Money.make(amount, currency);
		expect(money).toBeInstanceOf(Money);
		expect(money.getAmount()).toBe(amount);
		expect(money.getCurrency()).toBe(currency);
	});

	it("should set locale", () => {
		const money = Money.make(Dinero({ amount, currency }), currency);
		const moneyWithLocale = money.setLocale("en-US");
		expect(moneyWithLocale).toBeInstanceOf(Money);
		expect(moneyWithLocale.format("$0,0.00")).toBe("$10.00");
	});

	it("should perform arithmetic operations", () => {
		const money = Money.make(Dinero({ amount, currency }), currency);
		const other = Money.make(Dinero({ amount: 500, currency }), currency);

		const resultPlus = money.plus(other);
		expect(resultPlus.getAmount()).toBe(1500);

		const resultMinus = money.minus(other);
		expect(resultMinus.getAmount()).toBe(500);

		const resultTimes = money.times(2);
		expect(resultTimes.getAmount()).toBe(2000);

		const resultDivide = money.divide(2);
		expect(resultDivide.getAmount()).toBe(500);
	});

	it("should throw when performing arithmetic with different currencies", () => {
		const moneyUSD = Money.make(Dinero({ amount: 1000, currency: "USD" }), "USD");
		const moneyEUR = Money.make(Dinero({ amount: 1000, currency: "EUR" }), "EUR");

		expect(() => moneyUSD.plus(moneyEUR)).toThrow();
		expect(() => moneyUSD.minus(moneyEUR)).toThrow();
	});

	it("should handle division by zero", () => {
		const money = Money.make(Dinero({ amount: 1000, currency }), currency);
		// Dinero.js throws a TypeError when dividing by a non-integer.
		expect(() => money.divide(0)).toThrow(Error);
	});

	it("should perform comparisons", () => {
		const money = Money.make(Dinero({ amount, currency }), currency);
		const equal = Money.make(Dinero({ amount: 1000, currency }), currency);
		const greater = Money.make(Dinero({ amount: 1500, currency }), currency);
		const lesser = Money.make(Dinero({ amount: 500, currency }), currency);

		expect(money.isEqualTo(equal)).toBe(true);
		expect(money.isLessThan(greater)).toBe(true);
		expect(money.isLessThanOrEqual(equal)).toBe(true);
		expect(money.isLessThanOrEqual(lesser)).toBe(false);
		expect(money.isGreaterThan(lesser)).toBe(true);
		expect(money.isGreaterThanOrEqual(equal)).toBe(true);
		expect(money.isGreaterThanOrEqual(greater)).toBe(false);
	});

	it("should check if positive or negative", () => {
		const positive = Money.make(Dinero({ amount: 1000, currency }), currency);
		const negative = Money.make(Dinero({ amount: -1000, currency }), currency);
		const zero = Money.make(Dinero({ amount: 0, currency }), currency);

		expect(positive.isPositive()).toBe(true);
		expect(positive.isNegative()).toBe(false);

		expect(negative.isPositive()).toBe(false);
		expect(negative.isNegative()).toBe(true);

		// Dinero.js considers 0 to be positive
		expect(zero.isPositive()).toBe(true);
		expect(zero.isNegative()).toBe(false);
	});

	it("should format to string", () => {
		const money = Money.make(Dinero({ amount: 123_456, currency }), currency);
		expect(money.format("$0,0.00")).toBe("$1,234.56");
		expect(money.format()).toBe("$1,234.56");
	});

	it("should convert to unit", () => {
		const money = Money.make(Dinero({ amount: 123_456, currency }), currency);
		expect(money.toUnit()).toBe(1234.56);
	});
});
