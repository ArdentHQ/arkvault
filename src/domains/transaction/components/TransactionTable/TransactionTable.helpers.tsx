import { Column } from "react-table";
import { DTO } from "@ardenthq/sdk-profiles";
import { PendingTransaction } from "@/domains/transaction/components/TransactionTable/PendingTransactionsTable/PendingTransactionsTable.contracts";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const useTransactionTableColumns = ({ coin, hideSender }: { coin?: string; hideSender?: boolean }) => {
	const { t } = useTranslation();
	const coinLabel = coin ? `(${coin})` : "";

	return useMemo<Column<DTO.ExtendedConfirmedTransactionData>[]>(() => {
		const templateColumns: Column<DTO.ExtendedConfirmedTransactionData>[] = [
			{
				Header: t("COMMON.TX_ID"),
				cellWidth: "w-32 lg:w-36 xl:w-48",
				headerClassName: "no-border whitespace-nowrap",
				noRoundedBorders: true,
			},
			{
				Header: t("COMMON.AGE"),

				accessor: (transaction) => transaction.timestamp?.()?.toUNIX(),
				cellWidth: "w-48 xl:w-40",
				headerClassName: "hidden xl:table-cell no-border",
				id: "date",
				sortDescFirst: true,
			},
			{
				Header: t("COMMON.METHOD"),
				cellWidth: "w-40 lg:w-24 lg:min-w-24 xl:min-w-32",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.ADDRESSING"),
				cellWidth: "w-full lg:w-24",
				headerClassName: "no-border whitespace-nowrap",
			},
			...(hideSender
				? []
				: [
						{
							headerClassName: "no-border hidden md-lg:table-cell lg:table-cell",
							id: "recipient",
						},
					]),
			{
				Header: `${t("COMMON.AMOUNT")} ${coinLabel}`,
				accessor: (transaction) => transaction.total?.(),
				cellWidth: "lg:min-w-24 xl:min-w-32",
				className: "justify-end",
				headerClassName: "no-border whitespace-nowrap",
				id: "amount",
			},
			{
				Header: t("COMMON.FIAT_VALUE"),
				accessor: () => "fiatValue",
				className: "justify-end",
				headerClassName: `no-border whitespace-nowrap hidden lg:table-cell ${hideSender ? "" : "pl-0! xl:min-w-28"}`,
				noRoundedBorders: true,
			},
		];

		return templateColumns;
	}, [t, coinLabel, hideSender]);
};

export const usePendingTransactionTableColumns = ({ coin }: { coin: string }) => {
	const { t } = useTranslation();

	const coinLabel = coin ? `(${coin})` : "";

	return useMemo<Column<PendingTransaction>[]>(
		() => [
			{
				Header: t("COMMON.TX_ID"),
				cellWidth: "min-w-32",
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
				Header: `${t("COMMON.VALUE")} ${coinLabel}`,
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
		[t, coinLabel],
	);
};
