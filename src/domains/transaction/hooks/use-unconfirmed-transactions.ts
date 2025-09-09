import { DTO } from "@/app/lib/profiles";
import { RawTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.contract";
import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

export interface UnconfirmedTransactionData {
	transaction: RawTransactionData;
	walletAddress: string;
	networkId: string;
}

interface UseUnconfirmedTransactionsReturn {
	unconfirmedTransactions: UnconfirmedTransactionData[];
	addUnconfirmedTransactionFromSigned: (transaction: DTO.ExtendedSignedTransactionData) => void;
	addUnconfirmedTransactionFromApi: (input: UnconfirmedTransactionData) => void;
	removeUnconfirmedTransaction: (hash: string) => void;
	cleanupUnconfirmedForAddresses: (walletAddresses: string[], remoteHashes: string[]) => void;
}

export const useUnconfirmedTransactions = (): UseUnconfirmedTransactionsReturn => {
	const [unconfirmedTransactions, setUnconfirmedTransactions] = useLocalStorage<UnconfirmedTransactionData[]>(
		"unconfirmed-transactions",
		[],
	);

	const addUnconfirmedTransactionFromSigned = useCallback(
		(transaction: DTO.ExtendedSignedTransactionData) => {
			try {
				const data = transaction.data();
				const unconfirmed: UnconfirmedTransactionData = {
					networkId: transaction.wallet().networkId(),
					transaction: data,
					walletAddress: transaction.wallet().address(),
				};

				const newHash = transaction.hash();

				setUnconfirmedTransactions((prev) => {
					const filtered = prev.filter((p) => p.transaction.signedData.hash !== newHash);
					return [...filtered, unconfirmed];
				});
			} catch (error) {
				console.error("Failed to add unconfirmed transaction:", error);
			}
		},
		[setUnconfirmedTransactions],
	);

	const addUnconfirmedTransactionFromApi = useCallback(
		(input: UnconfirmedTransactionData) => {
			try {
				const signedData: RawTransactionData = input.transaction;

				const unconfirmed: UnconfirmedTransactionData = {
					networkId: input.networkId,
					transaction: { signedData },
					walletAddress: input.walletAddress,
				};
				console.log("Adding unconfirmed transaction from API:", unconfirmed);

				setUnconfirmedTransactions((prev) => {
					const target = input.transaction.hash;
					const filtered = prev.filter((p) => p.transaction.signedData.hash !== target);
					return [...filtered, unconfirmed];
				});
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error("Failed to add unconfirmed transaction:", error);
			}
		},
		[setUnconfirmedTransactions],
	);

	const removeUnconfirmedTransaction = useCallback(
		(hash: string) => {
			setUnconfirmedTransactions((prev) =>
				prev.filter(({ transaction }) => transaction.signedData.hash !== hash),
			);
		},
		[setUnconfirmedTransactions],
	);

	// Remove unconfirmed transactions for the given wallet addresses that are not in the remote hashes anymore
	const cleanupUnconfirmedForAddresses = useCallback(
		(walletAddresses: string[], remoteHashes: string[]) => {
			const scope = new Set(walletAddresses);
			const keep = new Set(remoteHashes);

			setUnconfirmedTransactions((prev) =>
				prev.filter((unconfirmedTransaction) => {
					if (!scope.has(unconfirmedTransaction.walletAddress)) {
						return true;
					}
					return keep.has(unconfirmedTransaction.transaction.signedData.hash);
				}),
			);
		},
		[setUnconfirmedTransactions],
	);

	return {
		addUnconfirmedTransactionFromApi,
		addUnconfirmedTransactionFromSigned,
		cleanupUnconfirmedForAddresses,
		removeUnconfirmedTransaction,
		unconfirmedTransactions,
	};
};
