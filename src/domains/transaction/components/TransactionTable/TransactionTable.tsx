import { DTO } from "@/app/lib/profiles";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { TableState } from "react-table";

import { TransactionRow } from "./TransactionRow/TransactionRow";
import { ExtendedTransactionDTO, TransactionTableProperties } from "./TransactionTable.contracts";
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
	hideSender = false,
	sortBy,
	onSortChange,
}) => {
	const [coinName, setCoinName] = useState<string>();
	const { isXs, isSm, isMdAndAbove } = useBreakpoint();
	const columns = useTransactionTableColumns({ coin: coinName, hideSender });

	useEffect(() => {
		try {
			const wallet = profile.wallets().first();
			setCoinName(wallet.currency());
		} catch {
			//
		}
	}, [profile]);

	const initialState = useMemo<Partial<TableState<DTO.ExtendedConfirmedTransactionData>>>(
		() => ({
			sortBy: [
				{
					desc: sortBy.desc,
					id: sortBy.column,
				},
			],
		}),
		[sortBy.column, sortBy.desc],
	);

	const showSkeleton = isLoading && transactions.length === 0;

	const data = useMemo<ExtendedTransactionDTO[]>(() => {
		const skeletonRows: ExtendedTransactionDTO[] = Array.from(
			{ length: skeletonRowsLimit },
			() => ({}) as ExtendedTransactionDTO
		);
		return showSkeleton ? skeletonRows : transactions;
	}, [showSkeleton, transactions, skeletonRowsLimit]);

	const renderTableRow = useCallback(
		(row: ExtendedTransactionDTO) => (
			<TransactionRow
				isLoading={showSkeleton}
				onClick={() => onRowClick?.(row)}
				transaction={row}
				exchangeCurrency={exchangeCurrency}
				profile={profile}
				hideSender={hideSender}
			/>
		),
		[showSkeleton, onRowClick, exchangeCurrency, profile, hideSender],
	);

	return (
		<div data-testid="TransactionTable" className="relative">
			<Table
				hideHeader={isSm || isXs || hideHeader}
				columns={columns}
				data={data}
				initialState={initialState}
				onSortChange={onSortChange}
				manualSortBy
				className={cn({ "with-x-padding": isMdAndAbove })}
			>
				{renderTableRow}
			</Table>
		</div>
	);
};
