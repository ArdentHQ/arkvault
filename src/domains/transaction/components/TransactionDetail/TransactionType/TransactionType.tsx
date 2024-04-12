import React from "react";
import { useTranslation } from "react-i18next";

import { Networks } from "@ardenthq/sdk";
import {
	TransactionDetail,
	TransactionDetailProperties,
} from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { TransactionResponsiveIcon } from "@/domains/transaction/components/TransactionDetail/TransactionResponsiveIcon/TransactionResponsiveIcon";

type TransactionSenderProperties = {
	type: string;
	network: Networks.Network;
} & TransactionDetailProperties;

export const TransactionType = ({ type, network, ...properties }: TransactionSenderProperties) => {
	const { t } = useTranslation();

	const { getIcon, getLabel } = useTransactionTypes();

	return (
		<TransactionDetail
			data-testid="TransactionType"
			label={t("TRANSACTION.TRANSACTION_TYPE")}
			extra={<TransactionResponsiveIcon icon={getIcon(type)} />}
			{...properties}
		>
			{getLabel(type, network)}
		</TransactionDetail>
	);
};
