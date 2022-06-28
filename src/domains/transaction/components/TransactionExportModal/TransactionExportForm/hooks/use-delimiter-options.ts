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
				label: t("TRANSACTION.EXPORT.FORM.COMMA"),
				secondaryLabel: "( , )",
				symbol: ",",
				value: CSVDelimiter.Comma,
			},
			{
				active: selectedValue === CSVDelimiter.Semicolon,
				label: t("TRANSACTION.EXPORT.FORM.SEMICOLON"),
				secondaryLabel: "( ; )",
				symbol: ";",
				value: CSVDelimiter.Semicolon,
			},
			{
				active: selectedValue === CSVDelimiter.Tab,
				label: t("TRANSACTION.EXPORT.FORM.TAB"),
				secondaryLabel: "( \\t )",
				symbol: "\\t",
				value: CSVDelimiter.Tab,
			},
			{
				active: selectedValue === CSVDelimiter.Space,
				label: t("TRANSACTION.EXPORT.FORM.SPACE"),
				secondaryLabel: "(   )",
				symbol: " ",
				value: CSVDelimiter.Space,
			},
			{
				active: selectedValue === CSVDelimiter.Pipe,
				label: t("TRANSACTION.EXPORT.FORM.PIPE"),
				secondaryLabel: "( | )",
				symbol: "|",
				value: CSVDelimiter.Pipe,
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
