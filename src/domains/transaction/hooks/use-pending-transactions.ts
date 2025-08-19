import { useCallback, useEffect } from "react";
import { DTO } from "@/app/lib/profiles";
import { useLocalStorage } from "usehooks-ts";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { RawTransactionData, SignedTransactionObject } from "@/app/lib/mainsail/signed-transaction.dto.contract";

// interface PendingTransactionData {
// 	convertedAmount: number;
// 	convertedTotal: number;
// 	explorerLink: string;
// 	fee: number;
// 	from: string;
// 	hash: string;
// 	isMultiPayment: boolean;
// 	isReturn: boolean;
// 	isTransfer: boolean;
// 	isUsernameRegistration: boolean;
// 	isUsernameResignation: boolean;
// 	isUnvote: boolean;
// 	isUpdateValidator: boolean;
// 	isValidatorResignation: boolean;
// 	isValidatorRegistration: boolean;
// 	isVote: boolean;
// 	isVoteCombination: boolean;
// 	networkId: string;
// 	nonce: BigNumber;
// 	recipients?: DTO.ExtendedTransactionRecipient[];
// 	timestamp: DateTime;
// 	to: string;
// 	total: number;
// 	type: string;
// 	value: number;
// 	walletAddress: string;
// }

interface PendingTransactionData {
	transaction: RawTransactionData;
	walletAddress: string;
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
					transaction: transaction.data(),
					walletAddress: transaction.wallet().address(),
				};

				setPendingTransactions((prev) => {
					const filtered = prev.filter((tx) => tx.transaction.hash !== transaction.hash());
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
			setPendingTransactions((prev) =>
				prev.filter(({ transaction }) => {
					return transaction.signedData.hash !== hash;
				}),
			);
		},
		[setPendingTransactions],
	);

	return {
		addPendingTransaction,
		pendingTransactions,
		removePendingTransaction,
	};
};
