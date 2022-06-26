import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TransactionType } from "@/domains/transaction/components/TransactionExportModal";

export const useTransactionTypeOptions = ({ selectedValue }: { selectedValue: TransactionType }) => {
	const { t } = useTranslation();

	const options = useMemo(
		() => [
			{
				active: selectedValue === TransactionType.All,
				value: TransactionType.All,
				label: t("TRANSACTION.ALL"),
			},
			{
				active: selectedValue === TransactionType.Incoming,
				value: TransactionType.Incoming,
				label: t("TRANSACTION.INCOMING"),
			},
			{
				active: selectedValue === TransactionType.Outgoing,
				value: TransactionType.Outgoing,
				label: t("TRANSACTION.OUTGOING"),
			},
		],
		[selectedValue],
	);

	return {
		options,
	};
};
