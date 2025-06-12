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
});
