import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DateRange } from "@/domains/transaction/components/TransactionExportModal";

export const useDateRangeOptions = ({ selectedValue }: { selectedValue: DateRange }) => {
	const { t } = useTranslation();

	const selected = useMemo(() => {
		const labels: Record<DateRange, string> = {
			[DateRange.CurrentMonth]: t("TRANSACTION.EXPORT.FORM.CURRENT_MONTH"),
			[DateRange.LastMonth]: t("TRANSACTION.EXPORT.FORM.LAST_MONTH"),
			[DateRange.CurrentQuarter]: t("TRANSACTION.EXPORT.FORM.CURRENT_QUARTER"),
			[DateRange.LastQuarter]: t("TRANSACTION.EXPORT.FORM.LAST_QUARTER"),
			[DateRange.CurrentYear]: t("TRANSACTION.EXPORT.FORM.CURRENT_YEAR"),
			[DateRange.LastYear]: t("TRANSACTION.EXPORT.FORM.LASTYEAR"),
			[DateRange.All]: t("TRANSACTION.EXPORT.FORM.ALL"),
			[DateRange.Custom]: t("TRANSACTION.EXPORT.FORM.CUSTOM"),
		};
		return labels[selectedValue];
	}, [selectedValue, t]);

	return { selected };
};
