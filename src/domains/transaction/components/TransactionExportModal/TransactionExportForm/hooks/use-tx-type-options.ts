import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TransactionType } from "@/domains/transaction/components/TransactionExportModal";

export const useTransactionTypeOptions = ({ selectedValue }: { selectedValue: TransactionType }) => {
	const { t } = useTranslation();

	const options = useMemo(
		() => [
			{
				active: selectedValue === TransactionType.Incoming,
				label: t("TRANSACTION.INCOMING"),
				value: TransactionType.Incoming,
			},
			{
				active: selectedValue === TransactionType.Outgoing,
				label: t("TRANSACTION.OUTGOING"),
				value: TransactionType.Outgoing,
			},
			{
				active: selectedValue === TransactionType.All,
				label: t("TRANSACTION.ALL"),
				value: TransactionType.All,
			},
		],
		[selectedValue],
	);

	return {
		options,
	};
};
