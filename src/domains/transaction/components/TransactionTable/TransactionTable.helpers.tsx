import { Column } from "react-table";
import { DTO } from "@/app/lib/profiles";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const useTransactionTableColumns = ({ coin, hideSender }: { coin?: string; hideSender?: boolean }) => {
	const { t } = useTranslation();
	const coinLabel = coin ? `(${coin})` : "";

	return useMemo<Column<DTO.ExtendedConfirmedTransactionData>[]>(() => {
		const templateColumns: Column<DTO.ExtendedConfirmedTransactionData>[] = [
			{
				Header: t("COMMON.TX_ID"),
				cellWidth: "w-36 xl:w-48",
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
				cellWidth: "w-20 lg:min-w-40 lg:w-40",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.ADDRESSING"),
				cellWidth: "w-fit lg:w-24",
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
				disableSortBy: true,
				headerClassName: "no-border whitespace-nowrap",
				id: "amount",
			},
			{
				Header: t("COMMON.FIAT_VALUE"),
				accessor: () => "fiatValue",
				className: "justify-end",
				disableSortBy: true,
				headerClassName: `no-border whitespace-nowrap hidden xl:table-cell ${hideSender ? "" : "pl-0! xl:min-w-28"}`,
				noRoundedBorders: true,
			},
		];

		return templateColumns;
	}, [t, coinLabel, hideSender]);
};
