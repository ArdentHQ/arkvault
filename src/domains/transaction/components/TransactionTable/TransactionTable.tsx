import { DTO } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useMemo } from "react";
import { TableState } from "react-table";

import { TransactionRow } from "./TransactionRow/TransactionRow";
import { TransactionTableProperties } from "./TransactionTable.contracts";
import { Table } from "@/app/components/Table";
import { useTransactionTableColumns } from "@/domains/transaction/components/TransactionTable/TransactionTable.helpers";
import { useActiveWallet, useBreakpoint } from "@/app/hooks";

export const TransactionTable: FC<TransactionTableProperties> = ({
	transactions,
	exchangeCurrency,
	hideHeader = false,
	isLoading = false,
	skeletonRowsLimit = 8,
	onRowClick,
	profile,
}) => {
	const { isXs, isSm } = useBreakpoint();
	const activeWallet = useActiveWallet();
	const columns = useTransactionTableColumns({ coin: activeWallet.network().coinName() });
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
				currency={activeWallet.network().coin()}
				convertedBalance={activeWallet.convertedBalance()}
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
				className="with-x-padding"
			>
				{renderTableRow}
			</Table>
		</div>
	);
};
