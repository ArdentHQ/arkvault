import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";
import { DTO } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";
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
				/* istanbul ignore next -- @preserve */
				console.error("Failed to add unconfirmed transaction:", error);
			}
		},
		[setUnconfirmedTransactions],
	);

	const addUnconfirmedTransactionFromApi = useCallback(
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

				const unconfirmed: UnconfirmedTransactionData = {
					networkId: input.networkId,
					transaction: {
						signedData,
					},
					walletAddress: input.walletAddress,
				};

				setUnconfirmedTransactions((prev) => {
					const filtered = prev.filter((p) => p.transaction.signedData.hash !== input.hash);
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

	return {
		addUnconfirmedTransactionFromSigned,
		addUnconfirmedTransactionFromApi,
		removeUnconfirmedTransaction,
		unconfirmedTransactions,
	};
};
