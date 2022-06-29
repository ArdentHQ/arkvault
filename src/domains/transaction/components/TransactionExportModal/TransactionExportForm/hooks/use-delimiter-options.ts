import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DropdownOptionGroup } from "@/app/components/Dropdown";
import { CsvDelimiter } from "@/domains/transaction/components/TransactionExportModal";

export const useDelimiterOptions = ({ selectedValue }: { selectedValue: CsvDelimiter }) => {
	const { t } = useTranslation();

	const basicOptions = useMemo(
		() => [
			{
				active: selectedValue === CsvDelimiter.Comma,
				label: t("TRANSACTION.EXPORT.FORM.COMMA"),
				secondaryLabel: "( , )",
				symbol: ",",
				value: CsvDelimiter.Comma,
			},
			{
				active: selectedValue === CsvDelimiter.Semicolon,
				label: t("TRANSACTION.EXPORT.FORM.SEMICOLON"),
				secondaryLabel: "( ; )",
				symbol: ";",
				value: CsvDelimiter.Semicolon,
			},
			{
				active: selectedValue === CsvDelimiter.Tab,
				label: t("TRANSACTION.EXPORT.FORM.TAB"),
				secondaryLabel: "( \\t )",
				symbol: "\\t",
				value: CsvDelimiter.Tab,
			},
			{
				active: selectedValue === CsvDelimiter.Space,
				label: t("TRANSACTION.EXPORT.FORM.SPACE"),
				secondaryLabel: "(   )",
				symbol: " ",
				value: CsvDelimiter.Space,
			},
			{
				active: selectedValue === CsvDelimiter.Pipe,
				label: t("TRANSACTION.EXPORT.FORM.PIPE"),
				secondaryLabel: "( | )",
				symbol: "|",
				value: CsvDelimiter.Pipe,
			},
		],
		[selectedValue],
	);

	const options: DropdownOptionGroup[] = [
		{
			key: "all",
			options: basicOptions,
		},
	];

	return {
		options,
		selected: useMemo(() => basicOptions.find((option) => option.value === selectedValue), [selectedValue]),
	};
};
