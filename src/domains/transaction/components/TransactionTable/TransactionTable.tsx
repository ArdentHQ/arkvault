import { DTO } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useMemo } from "react";
import { TableState } from "react-table";

import { TransactionRow } from "./TransactionRow/TransactionRow";
import { TransactionTableProperties } from "./TransactionTable.contracts";
import { Table } from "@/app/components/Table";
import { useTransactionTableColumns } from "@/domains/transaction/components/TransactionTable/TransactionTable.helpers";
import { useBreakpoint } from "@/app/hooks";
import cn from "classnames";

export const TransactionTable: FC<TransactionTableProperties> = ({
	transactions,
	exchangeCurrency,
	hideHeader = false,
	isLoading = false,
	skeletonRowsLimit = 8,
	onRowClick,
	profile,
	coinName,
}) => {
	const { isXs, isSm, isMdAndAbove } = useBreakpoint();
	const columns = useTransactionTableColumns({ coin: coinName });
	const initialState = useMemo<Partial<TableState<DTO.ExtendedConfirmedTransactionData>>>(
		() => ({
			sortBy: [
				{
					desc: true,
					id: "date",
				},
			],
		}),
		[],
	);

	const showSkeleton = isLoading && transactions.length === 0;

	const data = useMemo<DTO.ExtendedConfirmedTransactionData[]>(() => {
		const skeletonRows: DTO.ExtendedConfirmedTransactionData[] = Array.from(
			{ length: skeletonRowsLimit },
			() => ({}) as DTO.ExtendedConfirmedTransactionData,
		);
		return showSkeleton ? skeletonRows : transactions;
	}, [showSkeleton, transactions, skeletonRowsLimit]);

	const renderTableRow = useCallback(
		(row: DTO.ExtendedConfirmedTransactionData) => (
			<TransactionRow
				isLoading={showSkeleton}
				onClick={() => onRowClick?.(row)}
				transaction={row}
				exchangeCurrency={exchangeCurrency}
				profile={profile}
			/>
		),
		[showSkeleton, onRowClick, exchangeCurrency, profile],
	);

	return (
		<div data-testid="TransactionTable" className="relative">
			<Table
				hideHeader={isSm || isXs || hideHeader}
				columns={columns}
				data={data}
				initialState={initialState}
				className={cn({ "with-x-padding": isMdAndAbove })}
			>
				{renderTableRow}
			</Table>
		</div>
	);
};
