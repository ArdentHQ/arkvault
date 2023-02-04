import React from "react";
import { useTranslation } from "react-i18next";

import { Networks } from "@ardenthq/sdk";
import {
	TransactionDetail,
	TransactionDetailProperties,
} from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { TransactionResponsiveIcon } from "@/domains/transaction/components/TransactionDetail/TransactionResponsiveIcon/TransactionResponsiveIcon";
import { TransactionMigrationIcon } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowMigrationDetails";
import { useBreakpoint } from "@/app/hooks";

type TransactionSenderProperties = {
	type: string;
	isMigration?: boolean;
	network?: Networks.Network;
} & TransactionDetailProperties;

export const TransactionType = ({ isMigration, type, network, ...properties }: TransactionSenderProperties) => {
	const { t } = useTranslation();

	const { getIcon, getLabel } = useTransactionTypes();
	const { isXs, isSm } = useBreakpoint();

	return (
		<TransactionDetail
			data-testid="TransactionType"
			label={t("TRANSACTION.TRANSACTION_TYPE")}
			extra={
				isMigration ? (
					<TransactionMigrationIcon network={network} isCompact={isXs || isSm} />
				) : (
					<TransactionResponsiveIcon icon={getIcon(type)} />
				)
			}
			{...properties}
		>
			{isMigration ? t("TRANSACTION.TRANSACTION_TYPES.MIGRATION") : getLabel(type)}
		</TransactionDetail>
	);
};
