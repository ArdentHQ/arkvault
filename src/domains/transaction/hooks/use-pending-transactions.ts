import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";
import { DTO } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";
import { RawTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.contract";
import { UnconfirmedTransaction } from "@/app/lib/mainsail/pending-transaction.contract";

export interface PendingTransactionData {
	transaction: RawTransactionData;
	walletAddress: string;
	networkId: string;
}

interface UsePendingTransactionsReturn {
	pendingTransactions: PendingTransactionData[];
	addPendingTransaction: (transaction: DTO.ExtendedSignedTransactionData) => void;
	addPendingTransactionFromUnconfirmed: (
		input: UnconfirmedTransaction & {
			walletAddress: string;
			networkId: string;
			gasLimit?: string | number;
		},
	) => void;
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
				const data = transaction.data();
				const pending: PendingTransactionData = {
					networkId: transaction.wallet().networkId(),
					transaction: data,
					walletAddress: transaction.wallet().address(),
				};

				const newHash = transaction.hash();

				setPendingTransactions((prev) => {
					const filtered = prev.filter((p) => p.transaction.signedData.hash !== newHash);
					return [...filtered, pending];
				});
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error("Failed to add pending transaction:", error);
			}
		},
		[setPendingTransactions],
	);

	const addPendingTransactionFromUnconfirmed = useCallback(
		(input: UnconfirmedTransaction & { walletAddress: string; networkId: string; gasLimit?: string | number }) => {
			try {
				const gasLimitLike = (input as any).gasLimit ?? input.gas;
				const signedData: RawTransactionData = {
					data: input.data,
					from: input.from,
					gasLimit: Number(gasLimitLike ?? 0),
					gasPrice: input.gasPrice as any,
					hash: input.hash,
					nonce: BigNumber.make(input.nonce),
					senderPublicKey: (input as any).senderPublicKey,
					to: input.to,
					value: input.value,
				};

				const pending: PendingTransactionData = {
					networkId: input.networkId,
					transaction: {
						serialized: "",
						signedData,
					},
					walletAddress: input.walletAddress,
				};

				setPendingTransactions((prev) => {
					const filtered = prev.filter((p) => p.transaction.signedData.hash !== input.hash);
					return [...filtered, pending];
				});
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error("Failed to add unconfirmed pending transaction:", error);
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
		addPendingTransactionFromUnconfirmed,
		pendingTransactions,
		removePendingTransaction,
	};
};
