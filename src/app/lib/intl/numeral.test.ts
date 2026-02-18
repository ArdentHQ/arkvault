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
		["vigintillion", 10n ** 63n, { suffix: "Vg", value: 1 }],
		["novemdecillion", 10n ** 60n, { suffix: "Nod", value: 1 }],
		["octodecillion", 10n ** 57n, { suffix: "Ocd", value: 1 }],
		["septendecillion", 10n ** 54n, { suffix: "Spd", value: 1 }],
		["sexdecillion", 10n ** 51n, { suffix: "Sxd", value: 1 }],
		["quindecillion", 10n ** 48n, { suffix: "Qid", value: 1 }],
		["quattuordecillion", 10n ** 45n, { suffix: "Qad", value: 1 }],
		["tredecillion", 10n ** 42n, { suffix: "Td", value: 1 }],
		["duodecillion", 10n ** 39n, { suffix: "Dd", value: 1 }],
		["undecillion", 10n ** 36n, { suffix: "Ud", value: 1 }],
		["decillion", 10n ** 33n, { suffix: "Dc", value: 1 }],
		["nonillion", 10n ** 30n, { suffix: "No", value: 1 }],
		["octillion", 10n ** 27n, { suffix: "Oc", value: 1 }],
		["septillion", 10n ** 24n, { suffix: "Sp", value: 1 }],
		["sextillion", 10n ** 21n, { suffix: "Sx", value: 1 }],
		["quintillion", 10n ** 18n, { suffix: "Qi", value: 1 }],
		["quadrillion", 10n ** 15n, { suffix: "Qa", value: 1 }],
		["trillion", 10n ** 12n, { suffix: "T", value: 1 }],
		["billion", 10n ** 9n, { suffix: "B", value: 1 }],
		["million", 10n ** 6n, { suffix: "M", value: 1 }],
		["thousand", 10n ** 3n, { suffix: "K", value: 1 }],
		["below_thousand", 999, { suffix: undefined, value: 999 }],
		["zero", 0, { suffix: undefined, value: 0 }],
	])("should format compact a value in %s", (_, input, expected) => {
		const numeral = Numeral.make("en-US");
		const result = numeral.formatCompact(input);
		expect(result).toEqual(expected);
	});
});
