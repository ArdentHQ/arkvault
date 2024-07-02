import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";

import { Table } from "@/app/components/Table";
import { useBreakpoint } from "@/app/hooks";

import { UnconfirmedTransactionRow } from "./UnconfirmedTransactionRow";

interface Properties {
	transactions: DTO.ExtendedConfirmedTransactionData[];
	profile: Contracts.IProfile;
}

export const UnconfirmedTransactionTable = memo(({ transactions, profile }: Properties) => {
	const { t } = useTranslation();
	const { isXs, isSm } = useBreakpoint();

	const columns = (): Column<DTO.ExtendedConfirmedTransactionData> => {
		if (isSm || isXs) {
			return [
				{
					Header: t("COMMON.DATE"),
					className: "hidden",
				},
			];
		}

		return [
			{
				Header: t("COMMON.DATE"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (transaction) => transaction.timestamp?.()?.toUNIX(),
				sortDescFirst: true,
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
			},
		];
	};

	return (
		<div data-testid="TransactionTable" className="relative">
			<Table hideHeader={isSm || isXs} columns={columns()} data={transactions}>
				{(row: DTO.ExtendedConfirmedTransactionData) => (
					<UnconfirmedTransactionRow transaction={row} profile={profile} />
				)}
			</Table>
		</div>
	);
});

UnconfirmedTransactionTable.displayName = "UnconfirmedTransactionTable";
