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
				value: DateRange.CurrentMonth,
				label: t("TRANSACTION.EXPORT.FORM.CURRENT_MONTH"),
			},
			{
				active: selectedValue === DateRange.LastMonth,
				value: DateRange.LastMonth,
				label: t("TRANSACTION.EXPORT.FORM.LAST_MONTH"),
			},
			{
				active: selectedValue === DateRange.LastQuarter,
				value: DateRange.LastQuarter,
				label: t("TRANSACTION.EXPORT.FORM.LASTQUARTER"),
			},
			{
				active: selectedValue === DateRange.YearToDate,
				value: DateRange.YearToDate,
				label: t("TRANSACTION.EXPORT.FORM.YEARTODATE"),
			},
			{
				active: selectedValue === DateRange.LastYear,
				value: DateRange.LastYear,
				label: t("TRANSACTION.EXPORT.FORM.LASTYEAR"),
			},
			{
				active: selectedValue === DateRange.All,
				value: DateRange.All,
				label: t("TRANSACTION.EXPORT.FORM.ALL"),
			},
		],
		[selectedValue],
	);

	const customOptions = useMemo(
		() => [
			{
				active: selectedValue === DateRange.Custom,
				value: DateRange.Custom,
				label: t("TRANSACTION.EXPORT.FORM.CUSTOM"),
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
