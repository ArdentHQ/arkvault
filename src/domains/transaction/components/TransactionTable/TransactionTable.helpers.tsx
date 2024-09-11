import { DTO } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";

import { PendingTransaction } from "@/domains/transaction/components/TransactionTable/PendingTransactionsTable/PendingTransactionsTable.contracts";

export const useTransactionTableColumns = ({ coin }: { coin?: string }) => {
	const { t } = useTranslation();

	return useMemo<Column<DTO.ExtendedConfirmedTransactionData>[]>(() => {
		const templateColumns: Column<DTO.ExtendedConfirmedTransactionData>[] = [
			{
				Header: t("COMMON.TX_ID"),
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.AGE"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (transaction) => transaction.timestamp?.()?.toUNIX(),
				headerClassName: "hidden xl:table-cell no-border",
				id: "date",
				sortDescFirst: true,
			},
			{
				Header: t("COMMON.TYPE"),
				cellWidth: "min-w-24",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.ADDRESSING"),
				cellWidth: "min-w-32",
				headerClassName: "no-border",
			},
			{
				Header: `${t("COMMON.VALUE")} (${coin})`,
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (transaction) => transaction.total?.(),
				className: "justify-end",
				headerClassName: "no-border",
				id: "amount",
			},
			{
				Header: t("COMMON.FIAT_VALUE"),
				accessor: () => "fiatValue",
				className: "justify-end",
				headerClassName: "no-border hidden lg:table-cell",
			},
		];

		return templateColumns;
	}, [t, coin]);
};

export const usePendingTransactionTableColumns = ({ coin }: { coin: string }) => {
	const { t } = useTranslation();

	return useMemo<Column<PendingTransaction>[]>(
		() => [
			{
				Header: t("COMMON.TX_ID"),
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.AGE"),
				accessor: () => "timestamp",
				headerClassName: "hidden xl:table-cell no-border",
				sortDescFirst: true,
			},
			{
				Header: t("COMMON.TYPE"),
				cellWidth: "w-16",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.ADDRESSING"),
				cellWidth: "min-w-32",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.STATUS"),
				className: "justify-center",
				headerClassName: "hidden lg:table-cell no-border",
				minimumWidth: true,
			},
			{
				Header: `${t("COMMON.VALUE")} (${coin})`,
				accessor: () => "amount",
				className: "justify-end",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.FIAT_VALUE"),
				accessor: () => "fiatValue",
				className: "justify-end",
				headerClassName: "no-border hidden lg:table-cell",
			},
			{
				Header: t("COMMON.ACTION"),
				className: "hidden",
				headerClassName: "no-border",
				minimumWidth: true,
			},
		],
		[t],
	);
};
