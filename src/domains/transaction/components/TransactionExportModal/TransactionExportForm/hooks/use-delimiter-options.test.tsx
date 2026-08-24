import { renderHook } from "@testing-library/react";
import { useDelimiterOptions } from "./use-delimiter-options";
import { CsvDelimiter } from "@/domains/transaction/components/TransactionExportModal";
import type { JSX } from "react";

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

	it("should render secondary labels correctly", () => {
		const { result } = renderHook(() => useDelimiterOptions({ selectedValue: CsvDelimiter.Comma }));

		const commaOption = result.current.options.find((o) => o.value === CsvDelimiter.Comma);
		expect(commaOption?.secondaryLabel).toBeDefined();

		const secondaryLabel = commaOption?.secondaryLabel as (isActive: boolean) => JSX.Element;
		const element = secondaryLabel(true);
		expect(element).toBeDefined();
	});

	it("should render secondary labels with inactive state", () => {
		const { result } = renderHook(() => useDelimiterOptions({ selectedValue: CsvDelimiter.Semicolon }));

		const commaOption = result.current.options.find((o) => o.value === CsvDelimiter.Comma);
		expect(commaOption?.secondaryLabel).toBeDefined();

		const secondaryLabel = commaOption?.secondaryLabel as (isActive: boolean) => JSX.Element;
		const element = secondaryLabel(false);
		expect(element).toBeDefined();
	});

	it("should render all secondary labels", () => {
		const { result } = renderHook(() => useDelimiterOptions({ selectedValue: CsvDelimiter.Comma }));

		for (const option of result.current.options) {
			if (option.secondaryLabel) {
				const secondaryLabel = option.secondaryLabel as (isActive: boolean) => JSX.Element;
				secondaryLabel(true);
				secondaryLabel(false);
			}
		}
	});
});
