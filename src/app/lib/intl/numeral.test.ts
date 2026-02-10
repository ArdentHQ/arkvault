import { describe, expect, it } from "vitest";
import { Numeral } from "./numeral";

describe("Numeral", () => {
	it("should make an instance of Numeral", () => {
		const numeral = Numeral.make("en-US");
		expect(numeral).toBeInstanceOf(Numeral);
	});

	it("should make an instance of Numeral without a locale", () => {
		const numeral = Numeral.make(undefined);
		expect(numeral).toBeInstanceOf(Numeral);
	});

	it("should format a number", () => {
		const numeral = Numeral.make("en-US");
		expect(numeral.format(1_234_567.89)).toBe("1,234,567.89");
	});

	it("should format a number without a locale", () => {
		const numeral = Numeral.make(undefined);
		expect(numeral.format(1_234_567.89)).toBe("1,234,567.89");
	});

	it("should format as currency", () => {
		const numeral = Numeral.make("en-US");
		expect(numeral.formatAsCurrency(1234.56, "USD")).toBe("$1,234.56");
	});

	it("should format as currency with options", () => {
		const numeral = Numeral.make("en-US", { currencyDisplay: "symbol" });
		expect(numeral.formatAsCurrency(1234.56, "USD")).toBe("$1,234.56");
	});

	it("should format as unit", () => {
		const numeral = Numeral.make("en-US");
		expect(numeral.formatAsUnit(1234.56, "mile-per-hour")).toBe("1,234.56 mph");
	});

	it("should format as unit with options", () => {
		const numeral = Numeral.make("en-US", {
			unitDisplay: "long",
		});
		expect(numeral.formatAsUnit(10, "liter")).toBe("10 liters");
	});

	it("should format as unit with options", () => {
		const numeral = Numeral.make("en-US", {
			unitDisplay: "long",
		});
		expect(numeral.formatAsUnit(10, "liter")).toBe("10 liters");
	});

	it.each([
		["decillion", 10n ** 33n, { value: 1, suffix: "De" }],
		["decillion_large", 12345678901234567890123456789012345n, { value: 12.345678901234568, suffix: "De" }],
		["nonillion", 10n ** 30n, { value: 1, suffix: "No" }],
		["octillion", 10n ** 27n, { value: 1, suffix: "Oc" }],
		["septillion", 10n ** 24n, { value: 1, suffix: "Sp" }],
		["sextillion", 10n ** 21n, { value: 1, suffix: "Sx" }],
		["quintillion", 10n ** 18n, { value: 1, suffix: "Qi" }],
		["quadrillion", 10n ** 15n, { value: 1, suffix: "Qa" }],
		["trillion", 10n ** 12n, { value: 1, suffix: "T" }],
		["billion", 10n ** 9n, { value: 1, suffix: "B" }],
		["million", 10n ** 6n, { value: 1, suffix: "M" }],
		["thousand", 10n ** 3n, { value: 1, suffix: "K" }],
		["below_thousand", 999, { value: 999, suffix: undefined }],
		["zero", 0, { value: 0, suffix: undefined }],
	])("should format compact a value in %s", (_, input, expected) => {
		const numeral = Numeral.make("en-US");
		const result = numeral.formatCompact(input);
		expect(result).toEqual(expected);
	});
});
