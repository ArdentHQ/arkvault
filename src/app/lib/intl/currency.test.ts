import { describe, expect, it, vi } from "vitest";

import { Currency } from "./currency";

describe("Currency", () => {
	it("fromString should handle empty string", () => {
		expect(Currency.fromString("")).toEqual({
			display: "",
			value: undefined,
		});
	});

	it("fromString should handle basic number input", () => {
		expect(Currency.fromString("123.45")).toEqual({
			display: "123.45",
			value: "12345000000",
		});
	});

	it("fromString should handle zero input", () => {
		expect(Currency.fromString("0")).toEqual({
			display: "0",
			value: "0",
		});
	});

	it("fromString should handle leading zeros", () => {
		expect(Currency.fromString("00123.45")).toEqual({
			display: "123.45",
			value: "12345000000",
		});
	});

	it("fromString should respect magnitude parameter", () => {
		expect(Currency.fromString("123.45", 2)).toEqual({
			display: "123.45",
			value: "12345",
		});
	});

	it("fromString should handle magnitude of 0", () => {
		expect(Currency.fromString("123.45", 0)).toEqual({
			display: "123",
			value: "123",
		});
	});

	it("fromString should handle different locales", () => {
		// Test with French locale (uses comma as decimal separator)
		expect(Currency.fromString("123,45", 2, "fr-FR")).toEqual({
			display: "123,45",
			value: "12345",
		});

		// Test with German locale (uses comma as decimal separator)
		expect(Currency.fromString("123,45", 2, "de-DE")).toEqual({
			display: "123,45",
			value: "12345",
		});
	});

	it("fromString should handle numbers without decimal part", () => {
		expect(Currency.fromString("123")).toEqual({
			display: "123",
			value: "12300000000",
		});
	});

	it("fromString should handle numbers with only decimal part", () => {
		expect(Currency.fromString(".45")).toEqual({
			display: "0.45",
			value: "45000000",
		});
	});

	it("fromString should truncate decimals beyond magnitude", () => {
		expect(Currency.fromString("123.456789", 2)).toEqual({
			display: "123.45",
			value: "12345",
		});
	});

	it("fromString should handle multiple decimal separators", () => {
		expect(Currency.fromString("123.45.67")).toEqual({
			display: "123.4567",
			value: "12345670000",
		});
	});

	it("fromString should handle non-numeric characters", () => {
		expect(Currency.fromString("123abc.45")).toEqual({
			display: "123.45",
			value: "12345000000",
		});
	});

	it("fromString should use fallback separators when locale is not available", () => {
		const toLocaleStringSpy = vi.spyOn(Number.prototype, "toLocaleString").mockReturnValue("unexpected_format");

		// Test a specific locale from the fallback list ('es' uses ',')
		expect(Currency.fromString("123,45", 2, "es")).toEqual({
			display: "123,45",
			value: "12345",
		});

		// Test a locale NOT in the fallback list, should default to 'en' (which uses '.')
		// The input has a comma, but it should be converted to a dot.
		expect(Currency.fromString("123,45", 2, "xx-XX")).toEqual({
			display: "123.45",
			value: "12345",
		});

		toLocaleStringSpy.mockRestore();
	});

	it("fromString should handle locales with no decimal separator", () => {
		const toLocaleStringSpy = vi.spyOn(Number.prototype, "toLocaleString").mockReturnValue("100002"); // No separators

		// `dot` should fall back to ".". It should parse "1.2" correctly.
		expect(Currency.fromString("1.2", 2, "mock-locale")).toEqual({
			display: "1.2",
			value: "120",
		});

		toLocaleStringSpy.mockRestore();
	});

	it("fromString should handle multi-digit decimals after zero", () => {
		expect(Currency.fromString("0.12", 2)).toEqual({
			display: "0.12",
			value: "12",
		});
	});

	it("should cover fallback for default locale and decimal separator", () => {
		const spy = vi.spyOn(Number.prototype, "toLocaleString");

		// 1. Let the availability check pass, so we don't enter the if(localeNotAvailable) block
		spy.mockReturnValueOnce("$1.20");
		// 2. For the call inside getSeparators, return a value with no separators.
		// This will be called with "en-US" because we don't pass a locale to fromString.
		spy.mockReturnValueOnce("100002");

		// This call triggers both fallbacks:
		// - `locale` is undefined -> `|| "en-US"` is used.
		// - `seperator.decimal` will be undefined -> `|| "."` is used.
		expect(Currency.fromString("1.23", 2)).toEqual({
			display: "1.23",
			value: "123",
		});

		spy.mockRestore();
	});

	it("fromString should return value '0' if no digits are parsed", () => {
		expect(Currency.fromString("abc")).toEqual({
			display: "",
			value: "0",
		});
	});
});
