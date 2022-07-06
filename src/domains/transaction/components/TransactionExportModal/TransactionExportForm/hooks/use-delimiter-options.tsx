import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DropdownOptionGroup } from "@/app/components/Dropdown";
import { CsvDelimiter } from "@/domains/transaction/components/TransactionExportModal";

const renderLabel = (label: string, isActive: boolean) => (
	<span className="space-x-1">
		<span>(</span>
		<span className={isActive ? "text-theme-primary-600" : "text-theme-secondary-800 dark:text-theme-secondary-200"}>{ label }</span>
		<span>)</span>
	</span>
);

export const useDelimiterOptions = ({ selectedValue }: { selectedValue: CsvDelimiter }) => {
	const { t } = useTranslation();

	const options = useMemo(
		() => [
			{
				active: selectedValue === CsvDelimiter.Comma,
				label: t("TRANSACTION.EXPORT.FORM.COMMA"),
				secondaryLabel: (isActive: boolean) => renderLabel(",", isActive),
				symbol: ",",
				value: CsvDelimiter.Comma,
			},
			{
				active: selectedValue === CsvDelimiter.Semicolon,
				label: t("TRANSACTION.EXPORT.FORM.SEMICOLON"),
				secondaryLabel: (isActive: boolean) => renderLabel(";", isActive),
				symbol: ";",
				value: CsvDelimiter.Semicolon,
			},
			{
				active: selectedValue === CsvDelimiter.Tab,
				label: t("TRANSACTION.EXPORT.FORM.TAB"),
				secondaryLabel: (isActive: boolean) => renderLabel("\\t", isActive),
				symbol: "\\t",
				value: CsvDelimiter.Tab,
			},
			{
				active: selectedValue === CsvDelimiter.Pipe,
				label: t("TRANSACTION.EXPORT.FORM.PIPE"),
				secondaryLabel: (isActive: boolean) => renderLabel("|", isActive),
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
