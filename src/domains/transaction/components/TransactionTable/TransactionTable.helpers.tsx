import { DTO } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";

import { PendingTransaction } from "@/domains/transaction/components/TransactionTable/PendingTransactionsTable/PendingTransactionsTable.contracts";

export const useTransactionTableColumns = (exchangeCurrency?: string) => {
	const { t } = useTranslation();

	return useMemo<Column<DTO.ExtendedConfirmedTransactionData>[]>(() => {
		const templateColumns: Column<DTO.ExtendedConfirmedTransactionData>[] = [
			{
				Header: t("COMMON.ID"),
				minimumWidth: true,
			},
			{
				Header: t("COMMON.DATE"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (transaction) => transaction.timestamp?.()?.toUNIX(),
				cellWidth: "w-50",
				headerClassName: "hidden lg:table-cell",
				id: "date",
				sortDescFirst: true,
			},
			{
				Header: t("COMMON.SENDER"),
				cellWidth: "w-96",
			},
			{
				Header: t("COMMON.RECIPIENT"),
				cellWidth: "w-96",
			},
			{
				Header: t("COMMON.AMOUNT"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (transaction) => transaction.total?.(),
				className: "justify-end",
				id: "amount",
				sortDescFirst: true,
			},
		];

		if (exchangeCurrency) {
			templateColumns.push({
				Header: t("COMMON.CURRENCY"),
				cellWidth: "w-28",
				className: "justify-end float-right",
				headerClassName: "hidden xl:table-cell",
			});
		}

		return templateColumns;
	}, [t, exchangeCurrency]);
};

export const usePendingTransactionTableColumns = ({coin} : {coin:string}) => {
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
				cellWidth: "w-20",
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
				cellWidth: "w-32",
				headerClassName: "no-border"
			},
			{
				Header: t("COMMON.STATUS"),
				className: "justify-center",
				headerClassName: "hidden lg:table-cell no-border",
				minimumWidth: true,
			},
			{
				Header: `${t("COMMON.AMOUNT")} (${coin})`,
				accessor: () => "amount",
				className: "justify-end",
				innerClassName: "justify-end",
				headerClassName: "no-border",
			},
			{
				Header: `${t("COMMON.FEE")} (${coin})`,
				className: "justify-end hidden lg:table-cell xl:hidden",
				headerClassName: "hidden lg:table-cell no-border",
			},
			{
				Header: t("COMMON.FIAT_VALUE"),
				className: "justify-end hidden xl:table-cell",
				headerClassName: "hidden lg:table-cell no-border",
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
