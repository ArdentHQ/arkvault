import { DTO } from "@/app/lib/profiles";
import { RawTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.contract";
import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

interface UnconfirmedTransactions {
	[networkId: string]: {
		[walletAddress: string]: RawTransactionData[];
	};
}

interface UseUnconfirmedTransactionsReturn {
	unconfirmedTransactions: UnconfirmedTransactions;
	addUnconfirmedTransactionFromSigned: (transaction: DTO.ExtendedSignedTransactionData) => void;
	addUnconfirmedTransactionFromApi: (
		networkId: string,
		walletAddress: string,
		transaction: RawTransactionData,
	) => void;
	removeUnconfirmedTransaction: (hash: string) => void;
	cleanupUnconfirmedForAddresses: (walletAddresses: string[], remoteHashes: string[]) => void;
}

export const useUnconfirmedTransactions = (): UseUnconfirmedTransactionsReturn => {
	const [unconfirmedTransactions, setUnconfirmedTransactions] = useLocalStorage<UnconfirmedTransactions>(
		"unconfirmed-transactions",
		{},
	);

	const addUnconfirmedTransactionFromSigned = useCallback(
		(transaction: DTO.ExtendedSignedTransactionData) => {
			try {
				const data = transaction.data();
				const networkId = transaction.wallet().networkId();
				const walletAddress = transaction.wallet().address();
				const newHash = transaction.hash();

				setUnconfirmedTransactions((prev) => {
					const updated = { ...prev };

					if (!updated[networkId]) {
						updated[networkId] = {};
					}

					if (!updated[networkId][walletAddress]) {
						updated[networkId][walletAddress] = [];
					}

					updated[networkId][walletAddress] = updated[networkId][walletAddress].filter(
						(tx) => tx.signedData.hash !== newHash,
					);

					updated[networkId][walletAddress].push({
						...data,
						signedData: {
							...data.data(),
							timestamp: Date.now(),
						},
					});

					return updated;
				});
			} catch (error) {
				console.error("Failed to add unconfirmed transaction:", error);
			}
		},
		[setUnconfirmedTransactions],
	);

	const addUnconfirmedTransactionFromApi = useCallback(
		(networkId: string, walletAddress: string, transaction: RawTransactionData) => {
			try {
				const targetHash = transaction.hash;

				setUnconfirmedTransactions((prev) => {
					const updated = { ...prev };

					if (!updated[networkId]) {
						updated[networkId] = {};
					}

					if (!updated[networkId][walletAddress]) {
						updated[networkId][walletAddress] = [];
					}

					const localTransaction = updated[networkId][walletAddress].find(
						(tx) => tx.signedData.hash === targetHash,
					);

					updated[networkId][walletAddress] = updated[networkId][walletAddress].filter(
						(tx) => tx.signedData.hash !== targetHash,
					);

					const timestamp = localTransaction?.signedData.timestamp ?? Date.now();

					updated[networkId][walletAddress].push({
						signedData: {
							...transaction,
							timestamp,
						},
					});

					return updated;
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
			setUnconfirmedTransactions((prev) => {
				const updated = { ...prev };

				for (const networkId of Object.keys(updated)) {
					for (const walletAddress of Object.keys(updated[networkId])) {
						updated[networkId][walletAddress] = updated[networkId][walletAddress].filter(
							(tx) => tx.signedData.hash !== hash,
						);

						if (updated[networkId][walletAddress].length === 0) {
							delete updated[networkId][walletAddress];
						}
					}

					if (Object.keys(updated[networkId]).length === 0) {
						delete updated[networkId];
					}
				}

				return updated;
			});
		},
		[setUnconfirmedTransactions],
	);

	const cleanupUnconfirmedForAddresses = useCallback(
		(walletAddresses: string[], remoteHashes: string[]) => {
			const addressScope = new Set(walletAddresses);
			const keepHashes = new Set(remoteHashes);

			setUnconfirmedTransactions((prev) => {
				const updated = { ...prev };

				for (const networkId of Object.keys(updated)) {
					for (const walletAddress of Object.keys(updated[networkId])) {
						if (addressScope.has(walletAddress)) {
							updated[networkId][walletAddress] = updated[networkId][walletAddress].filter((tx) =>
								keepHashes.has(tx.signedData.hash),
							);

							if (updated[networkId][walletAddress].length === 0) {
								delete updated[networkId][walletAddress];
							}
						}
					}

					if (Object.keys(updated[networkId]).length === 0) {
						delete updated[networkId];
					}
				}

				return updated;
			});
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
