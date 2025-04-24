import { DTO } from "@/app/lib/profiles";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { PendingTransaction, Properties } from "./PendingTransactionsTable.contracts";
import { SignedTransactionRowMobile } from "@/domains/transaction/components/TransactionTable/TransactionRow/SignedTransactionRowMobile";
import { Table } from "@/app/components/Table";
import { PendingTransferRow } from "@/domains/transaction/components/TransactionTable/TransactionRow/PendingTransferRow";
import { PendingTransferRowMobile } from "@/domains/transaction/components/TransactionTable/TransactionRow/PendingTransferRowMobile";
import { SignedTransactionRow } from "@/domains/transaction/components/TransactionTable/TransactionRow/SignedTransactionRow";
import { usePendingTransactionTableColumns } from "@/domains/transaction/components/TransactionTable/TransactionTable.helpers";
import { useBreakpoint } from "@/app/hooks";
import { TableWrapper } from "@/app/components/Table/TableWrapper";

export const PendingTransactions = ({
	wallet,
	onClick,
	onPendingTransactionClick,
	pendingTransactions,
}: Properties) => {
	const { t } = useTranslation();

	const columns = usePendingTransactionTableColumns({ coin: wallet.network().coinName() });

	const { isXs, isSm } = useBreakpoint();

	const useResponsive = useMemo(() => isXs || isSm, [isXs, isSm]);

	const renderTableRow = useCallback(
		(transaction: PendingTransaction) => {
			/* NOTE: Pending transfer refers to the status of the transaction pending validation in the chain and not related to musig wallet */
			if (transaction.isPendingTransfer) {
				if (useResponsive) {
					return (
						<PendingTransferRowMobile
							wallet={wallet}
							transaction={transaction.transaction as DTO.ExtendedConfirmedTransactionData}
							onRowClick={onPendingTransactionClick}
						/>
					);
				}

				return (
					<PendingTransferRow
						wallet={wallet}
						transaction={transaction.transaction as DTO.ExtendedConfirmedTransactionData}
						onRowClick={onPendingTransactionClick}
					/>
				);
			}

			if (useResponsive) {
				return (
					<SignedTransactionRowMobile
						transaction={transaction.transaction as DTO.ExtendedSignedTransactionData}
						wallet={wallet}
						onRowClick={onClick}
					/>
				);
			}

			return (
				<SignedTransactionRow
					transaction={transaction.transaction as DTO.ExtendedSignedTransactionData}
					wallet={wallet}
					onRowClick={onClick}
				/>
			);
		},
		[wallet, onClick, onPendingTransactionClick, useResponsive],
	);

	return (
		<div data-testid="PendingTransactions" className="relative">
			<h2 className="mb-3 hidden text-2xl font-bold md:block">
				{t("WALLETS.PAGE_WALLET_DETAILS.PENDING_TRANSACTIONS")}
			</h2>

			<TableWrapper>
				<Table
					columns={columns}
					data={pendingTransactions}
					hideHeader={useResponsive}
					className="with-x-padding"
				>
					{renderTableRow}
				</Table>
			</TableWrapper>
		</div>
	);
};
