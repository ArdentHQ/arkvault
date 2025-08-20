import { useCallback } from "react";
import { DTO } from "@/app/lib/profiles";
import { useLocalStorage } from "usehooks-ts";
import { RawTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.contract";

export interface PendingTransactionData {
	transaction: RawTransactionData;
	walletAddress: string;
	networkId: string;
}

interface UsePendingTransactionsReturn {
	pendingTransactions: PendingTransactionData[];
	addPendingTransaction: (transaction: DTO.ExtendedSignedTransactionData) => void;
	removePendingTransaction: (hash: string) => void;
}

export const usePendingTransactions = (): UsePendingTransactionsReturn => {
	const [pendingTransactions, setPendingTransactions] = useLocalStorage<PendingTransactionData[]>(
		"pending-transactions",
		[],
	);

	const addPendingTransaction = useCallback(
		(transaction: DTO.ExtendedSignedTransactionData) => {
			try {
				const pendingTransaction: PendingTransactionData = {
					networkId: transaction.wallet().networkId(),
					transaction: transaction.data(),
					walletAddress: transaction.wallet().address(),
				};

				setPendingTransactions((prev) => {
					const filtered = prev.filter((tx) => tx.transaction.signedData.hash !== transaction.hash());
					return [...filtered, pendingTransaction];
				});
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error("Failed to add pending transaction:", error);
			}
		},
		[setPendingTransactions],
	);

	const removePendingTransaction = useCallback(
		(hash: string) => {
			setPendingTransactions((prev) => prev.filter(({ transaction }) => transaction.signedData.hash !== hash));
		},
		[setPendingTransactions],
	);

	return {
		addPendingTransaction,
		pendingTransactions,
		removePendingTransaction,
	};
};
