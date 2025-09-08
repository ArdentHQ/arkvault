import { useCallback } from "react";
import { DTO } from "@/app/lib/profiles";
import { useLocalStorage } from "usehooks-ts";
import { RawTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.contract";
import { UnconfirmedTransaction } from "@/app/lib/mainsail/unconfirmed-transaction.contract";

export interface UnconfirmedTransactionData {
	transaction: RawTransactionData;
	walletAddress: string;
	networkId: string;
}

interface UseUnconfirmedTransactionsReturn {
	unconfirmedTransactions: UnconfirmedTransactionData[];
	addUnconfirmedTransactionFromSigned: (transaction: DTO.ExtendedSignedTransactionData) => void;
	addUnconfirmedTransactionFromApi: (
		input: UnconfirmedTransaction & {
			walletAddress: string;
			networkId: string;
			gasLimit?: string | number;
		},
	) => void;
	removeUnconfirmedTransaction: (hash: string) => void;
	reconcileUnconfirmedForAddresses: (walletAddresses: string[], remoteHashes: string[]) => void;
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
		(input: UnconfirmedTransaction & { walletAddress: string; networkId: string; gasLimit?: string | number }) => {
			try {
				const signedData: RawTransactionData = {
					data: input.data,
					from: input.from,
					gasLimit: input.gasLimit,
					gasPrice: input.gasPrice,
					hash: input.hash,
					nonce: input.nonce,
					senderPublicKey: input.senderPublicKey,
					to: input.to,
					value: input.value,
				};

				const unconfirmed: UnconfirmedTransactionData = {
					networkId: input.networkId,
					transaction: { signedData },
					walletAddress: input.walletAddress,
				};

				setUnconfirmedTransactions((prev) => {
					const target = input.hash;
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

	const reconcileUnconfirmedForAddresses = useCallback(
		(walletAddresses: string[], remoteHashes: string[]) => {
			const scope = new Set(walletAddresses);
			const keep = new Set(remoteHashes);

			setUnconfirmedTransactions((prev) =>
				prev.filter((u) => {
					if (!scope.has(u.walletAddress)) {
						return true;
					}
					return keep.has(u.transaction.signedData.hash);
				}),
			);
		},
		[setUnconfirmedTransactions],
	);

	return {
		addUnconfirmedTransactionFromApi,
		addUnconfirmedTransactionFromSigned,
		reconcileUnconfirmedForAddresses,
		removeUnconfirmedTransaction,
		unconfirmedTransactions,
	};
};
