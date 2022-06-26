import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DropdownOptionGroup } from "@/app/components/Dropdown";
import { CSVDelimiter } from "@/domains/transaction/components/TransactionExportModal";

export const useDelimiterOptions = ({ selectedValue }: { selectedValue: CSVDelimiter }) => {
	const { t } = useTranslation();

	const basicOptions = useMemo(
		() => [
			{
				active: selectedValue === CSVDelimiter.Comma,
				value: CSVDelimiter.Comma,
				label: t("TRANSACTION.EXPORT.FORM.COMMA"),
				symbol: ",",
				secondaryLabel: "( , )",
			},
			{
				active: selectedValue === CSVDelimiter.Semicolon,
				value: CSVDelimiter.Semicolon,
				label: t("TRANSACTION.EXPORT.FORM.SEMICOLON"),
				symbol: ";",
				secondaryLabel: "( ; )",
			},
			{
				active: selectedValue === CSVDelimiter.Tab,
				value: CSVDelimiter.Tab,
				label: t("TRANSACTION.EXPORT.FORM.TAB"),
				symbol: "\\t",
				secondaryLabel: "( \\t )",
			},
			{
				active: selectedValue === CSVDelimiter.Space,
				value: CSVDelimiter.Space,
				label: t("TRANSACTION.EXPORT.FORM.SPACE"),
				symbol: " ",
				secondaryLabel: "(   )",
			},
			{
				active: selectedValue === CSVDelimiter.Pipe,
				value: CSVDelimiter.Pipe,
				label: t("TRANSACTION.EXPORT.FORM.PIPE"),
				symbol: "|",
				secondaryLabel: "( | )",
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
