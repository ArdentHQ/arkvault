import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DateRange } from "@/domains/transaction/components/TransactionExportSidePanel";

export const useDateRangeOptions = ({ selectedValue }: { selectedValue: DateRange }) => {
	const { t } = useTranslation();

	const options = useMemo(
		() => [
			{ label: t("TRANSACTION.EXPORT.FORM.CURRENT_MONTH"), value: DateRange.CurrentMonth },
			{ label: t("TRANSACTION.EXPORT.FORM.LAST_MONTH"), value: DateRange.LastMonth },
			{ label: t("TRANSACTION.EXPORT.FORM.CURRENT_QUARTER"), value: DateRange.CurrentQuarter },
			{ label: t("TRANSACTION.EXPORT.FORM.LAST_QUARTER"), value: DateRange.LastQuarter },
			{ label: t("TRANSACTION.EXPORT.FORM.CURRENT_YEAR"), value: DateRange.CurrentYear },
			{ label: t("TRANSACTION.EXPORT.FORM.LASTYEAR"), value: DateRange.LastYear },
			{ label: t("TRANSACTION.EXPORT.FORM.ALL"), value: DateRange.All },
			{ label: t("TRANSACTION.EXPORT.FORM.CUSTOM"), value: DateRange.Custom },
		],
		[t],
	);

	const selected = useMemo(
		() => options.find((option) => option.value === selectedValue)?.label,
		[options, selectedValue],
	);

	return { options, selected };
};
