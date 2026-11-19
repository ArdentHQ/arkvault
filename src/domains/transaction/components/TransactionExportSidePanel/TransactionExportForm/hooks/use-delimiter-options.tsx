import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CsvDelimiter } from "@/domains/transaction/components/TransactionExportSidePanel";

export const useDelimiterOptions = ({ selectedValue }: { selectedValue: CsvDelimiter }) => {
	const { t } = useTranslation();

	const options = useMemo(
		() => [
			{
				active: selectedValue === CsvDelimiter.Comma,
				label: t("TRANSACTION.EXPORT.FORM.COMMA"),
				symbol: ",",
				value: CsvDelimiter.Comma,
			},
			{
				active: selectedValue === CsvDelimiter.Semicolon,
				label: t("TRANSACTION.EXPORT.FORM.SEMICOLON"),
				symbol: ";",
				value: CsvDelimiter.Semicolon,
			},
			{
				active: selectedValue === CsvDelimiter.Tab,
				label: t("TRANSACTION.EXPORT.FORM.TAB"),
				symbol: "\\t",
				value: CsvDelimiter.Tab,
			},
			{
				active: selectedValue === CsvDelimiter.Pipe,
				label: t("TRANSACTION.EXPORT.FORM.PIPE"),
				symbol: "|",
				value: CsvDelimiter.Pipe,
			},
		],
		[selectedValue],
	);

	return {
		options,
		selected: useMemo(() => options.find((option) => option.value === selectedValue), [selectedValue]),
	};
};
