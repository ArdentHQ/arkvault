import { describe, expect, it } from "vitest";
import { Money } from "./money";

const amount = 1000;
const currency = "USD";

describe("Money", () => {
	it("should make an instance of Money", () => {
		const money = Money.make(amount, currency);
		expect(money).toBeInstanceOf(Money);
		expect(money.getAmount()).toBe(amount);
		expect(money.getCurrency()).toBe(currency);
	});

	it("should set locale", () => {
		const money = Money.make(amount, currency);
		const moneyWithLocale = money.setLocale("en-US");
		expect(moneyWithLocale).toBeInstanceOf(Money);
		expect(moneyWithLocale.format()).toBe("$10.00");
	});

	it("should perform arithmetic operations", () => {
		const money = Money.make(amount, currency);
		const other = Money.make(500, currency);

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
		const moneyUSD = Money.make(1000, "USD");
		const moneyEUR = Money.make(1000, "EUR");

		expect(() => moneyUSD.plus(moneyEUR)).toThrow();
		expect(() => moneyUSD.minus(moneyEUR)).toThrow();
	});

	it("should handle division by zero", () => {
		expect(() => Money.make(1000, currency).divide(0)).toThrow(Error);
	});

	it("should perform comparisons", () => {
		const money = Money.make(amount, currency);

		expect(money.isEqualTo(Money.make(1000, currency))).toBe(true);
		expect(money.isLessThan(Money.make(1500, currency))).toBe(true);
		expect(money.isLessThanOrEqual(Money.make(1000, currency))).toBe(true);
		expect(money.isLessThanOrEqual(Money.make(500, currency))).toBe(false);
		expect(money.isGreaterThan(Money.make(500, currency))).toBe(true);
		expect(money.isGreaterThanOrEqual(Money.make(1000, currency))).toBe(true);
		expect(money.isGreaterThanOrEqual(Money.make(1500, currency))).toBe(false);
	});

	it("should check if positive or negative", () => {
		expect(Money.make(1000, currency).isPositive()).toBe(true);
		expect(Money.make(1000, currency).isNegative()).toBe(false);
		expect(Money.make(-1000, currency).isPositive()).toBe(false);
		expect(Money.make(-1000, currency).isNegative()).toBe(true);
	});

	it("should format to string", () => {
		expect(Money.make(123_456, currency).format()).toBe("$1,234.56");
	});

	it("should convert to unit", () => {
		expect(Money.make(123_456, currency).toUnit()).toBe(1234.56);
	});
});
