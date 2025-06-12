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

		// Test with a locale from the static fallback list, e.g., 'es'
		expect(Currency.fromString("123,45", 2, "es")).toEqual({
			display: "123,45",
			value: "12345",
		});

		toLocaleStringSpy.mockRestore();
	});

	it("fromString should return value '0' if no digits are parsed", () => {
		expect(Currency.fromString("abc")).toEqual({
			display: "",
			value: "0",
		});
	});
});
