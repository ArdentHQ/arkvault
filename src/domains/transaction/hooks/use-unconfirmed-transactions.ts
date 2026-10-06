import { DTO } from "@/app/lib/profiles";
import { RawTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.contract";
import { useCallback, useEffect, useRef } from "react";
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
	cleanupUnconfirmedForAddresses: (walletAddresses: string[], remoteHashes: string[], graceMs?: number) => void;
}

export const useUnconfirmedTransactions = (): UseUnconfirmedTransactionsReturn => {
	const [unconfirmedTransactions, setUnconfirmedTransactions] = useLocalStorage<UnconfirmedTransactions>(
		"unconfirmed-transactions",
		{},
	);

	const latestTransactionsRef = useRef<UnconfirmedTransactions>(unconfirmedTransactions);

	useEffect(() => {
		latestTransactionsRef.current = unconfirmedTransactions;
	}, [unconfirmedTransactions]);

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
		(walletAddresses: string[], remoteHashes: string[], graceMs = 0) => {
			const addressScope = new Set(walletAddresses);

			const hasTransactions = Object.values(latestTransactionsRef.current ?? {}).some((byAddress) =>
				Object.keys(byAddress).some((address) => addressScope.has(address)),
			);

			if (!hasTransactions) {
				return;
			}

			const keepHashes = new Set(remoteHashes);
			const now = Date.now();

			setUnconfirmedTransactions((prev) => {
				const updated = { ...prev };

				for (const networkId of Object.keys(updated)) {
					for (const walletAddress of Object.keys(updated[networkId])) {
						if (addressScope.has(walletAddress)) {
							updated[networkId][walletAddress] = updated[networkId][walletAddress].filter((tx) => {
								// Keep anything the network still reports as pending.
								if (keepHashes.has(tx.signedData.hash)) {
									return true;
								}

								// A transaction we just broadcast may not be indexed by the node
								// yet, so keep it while it is inside the grace period and drop it once aged out.
								return now - (tx.signedData.timestamp ?? 0) < graceMs;
							});

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
