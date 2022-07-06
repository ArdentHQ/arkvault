import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DropdownOptionGroup } from "@/app/components/Dropdown";
import { DateRange } from "@/domains/transaction/components/TransactionExportModal";

export const useDateRangeOptions = ({ selectedValue }: { selectedValue: DateRange }) => {
	const { t } = useTranslation();

	const basicOptions = useMemo(
		() => [
			{
				active: selectedValue === DateRange.CurrentMonth,
				label: t("TRANSACTION.EXPORT.FORM.CURRENT_MONTH"),
				value: DateRange.CurrentMonth,
			},
			{
				active: selectedValue === DateRange.LastMonth,
				label: t("TRANSACTION.EXPORT.FORM.LAST_MONTH"),
				value: DateRange.LastMonth,
			},
			{
				active: selectedValue === DateRange.CurrentQuarter,
				label: t("TRANSACTION.EXPORT.FORM.CURRENT_QUARTER"),
				value: DateRange.CurrentQuarter,
			},
			{
				active: selectedValue === DateRange.LastQuarter,
				label: t("TRANSACTION.EXPORT.FORM.LAST_QUARTER"),
				value: DateRange.LastQuarter,
			},
			{
				active: selectedValue === DateRange.CurrentYear,
				label: t("TRANSACTION.EXPORT.FORM.CURRENT_YEAR"),
				value: DateRange.CurrentYear,
			},
			{
				active: selectedValue === DateRange.LastYear,
				label: t("TRANSACTION.EXPORT.FORM.LASTYEAR"),
				value: DateRange.LastYear,
			},
			{
				active: selectedValue === DateRange.All,
				label: t("TRANSACTION.EXPORT.FORM.ALL"),
				value: DateRange.All,
			},
		],
		[selectedValue],
	);

	const customOptions = useMemo(
		() => [
			{
				active: selectedValue === DateRange.Custom,
				label: t("TRANSACTION.EXPORT.FORM.CUSTOM"),
				value: DateRange.Custom,
			},
		],
		[selectedValue],
	);

	const options: DropdownOptionGroup[] = [
		{
			key: "all",
			options: basicOptions,
		},
		{
			hasDivider: true,
			key: "custom",
			options: customOptions,
		},
	];

	return {
		options,
		selected: useMemo(
			() => [...basicOptions, ...customOptions].find((option) => option.value === selectedValue),
			[selectedValue],
		),
	};
};
