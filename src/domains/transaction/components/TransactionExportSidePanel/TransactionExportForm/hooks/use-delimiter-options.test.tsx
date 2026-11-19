import { renderHook } from "@testing-library/react";
import { useDelimiterOptions } from "./use-delimiter-options";
import { CsvDelimiter } from "@/domains/transaction/components/TransactionExportSidePanel";

describe("useDelimiterOptions", () => {
	it("should return options with correct active states", () => {
		const { result } = renderHook(() => useDelimiterOptions({ selectedValue: CsvDelimiter.Comma }));

		expect(result.current.options).toHaveLength(4);
		expect(result.current.selected?.value).toBe(CsvDelimiter.Comma);
	});

	it("should return correct selected option for semicolon", () => {
		const { result } = renderHook(() => useDelimiterOptions({ selectedValue: CsvDelimiter.Semicolon }));

		expect(result.current.selected?.value).toBe(CsvDelimiter.Semicolon);
		expect(result.current.selected?.symbol).toBe(";");
	});

	it("should return correct selected option for tab", () => {
		const { result } = renderHook(() => useDelimiterOptions({ selectedValue: CsvDelimiter.Tab }));

		expect(result.current.selected?.value).toBe(CsvDelimiter.Tab);
		expect(result.current.selected?.symbol).toBe("\\t");
	});

	it("should return correct selected option for pipe", () => {
		const { result } = renderHook(() => useDelimiterOptions({ selectedValue: CsvDelimiter.Pipe }));

		expect(result.current.selected?.value).toBe(CsvDelimiter.Pipe);
		expect(result.current.selected?.symbol).toBe("|");
	});
});
