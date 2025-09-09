import { ConfirmedTransactionData } from "@/app/lib/mainsail/confirmed-transaction.dto";
import { DTO } from "@/app/lib/profiles";
import { RawTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.contract";
import { UnconfirmedTransaction } from "@/app/lib/mainsail/unconfirmed-transaction.contract";
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
		(
			input: ConfirmedTransactionData & { walletAddress: string; networkId: string; gasLimit?: string | number },
		) => {
			try {
				// TODO: improve typing here
				const signedData: RawTransactionData = {
					data: input.data.data,
					from: input.data.from,
					gasLimit: input.data.gasLimit,
					gasPrice: input.data.gasPrice,
					hash: input.data.hash,
					nonce: input.data.nonce,
					senderPublicKey: input.data.senderPublicKey,
					to: input.data.to,
					value: input.data.value,
				};

				const unconfirmed: UnconfirmedTransactionData = {
					networkId: input.networkId,
					transaction: { signedData },
					walletAddress: input.walletAddress,
				};
				console.log("Adding unconfirmed transaction from API:", unconfirmed);

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
