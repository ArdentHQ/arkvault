import React from "react";
import { useTranslation } from "react-i18next";

import {
	TransactionDetail,
	TransactionDetailProperties,
} from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { TransactionResponsiveIcon } from "@/domains/transaction/components/TransactionDetail/TransactionResponsiveIcon/TransactionResponsiveIcon";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";

type TransactionSenderProperties = {
	type: string;
} & TransactionDetailProperties;

export const TransactionType = ({ type, ...properties }: TransactionSenderProperties) => {
	const { t } = useTranslation();

	const { getIcon, getLabel } = useTransactionTypes();

	return (
		<TransactionDetail
			data-testid="TransactionType"
			label={t("TRANSACTION.TRANSACTION_TYPE")}
			extra={<TransactionResponsiveIcon icon={getIcon(type)} />}
			{...properties}
		>
			{getLabel(type)}
		</TransactionDetail>
	);
};
