import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useCallback, useMemo, useState } from "react";

import { useSynchronizer } from "@/app/hooks";
import { useTransaction } from "@/domains/transaction/hooks";

export const useWalletTransactions = (wallet: Contracts.IReadWriteWallet) => {
	const [isLoading, setIsLoading] = useState(false);

	const { fetchWalletUnconfirmedTransactions } = useTransaction();

	const [pendingTransfers, setPendingTransfers] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);
	const [pendingSigned, setPendingSigned] = useState<DTO.ExtendedSignedTransactionData[]>([]);

	const syncPending = useCallback(async () => {
		if (!wallet.hasBeenFullyRestored()) {
			return;
		}

		setIsLoading(true);
		await wallet.transaction().sync();

		const sent = await fetchWalletUnconfirmedTransactions(wallet);

		setIsLoading(false);
		setPendingTransfers(sent);

		setPendingSigned(
			Object.values({
				...wallet.transaction().signed(),
				...wallet.transaction().waitingForOtherSignatures(),
				...wallet.transaction().waitingForOurSignature(),
			}).filter((item) => !!item.get("multiSignature")),
		);
	}, [wallet, setPendingTransfers, setPendingSigned, fetchWalletUnconfirmedTransactions]);

	const pendingTransactions = useMemo(() => {
		const pending = [];

		for (const transaction of [...pendingSigned, ...pendingTransfers]) {
			let existingTransaction;

			try {
				existingTransaction = wallet.transaction().transaction(transaction.id());
			} catch {
				// Transaction not found.
			}

			// Check if transaction still exists in wallet's internal state.
			if (!existingTransaction) {
				continue;
			}

			const hasBeenSigned = wallet.transaction().hasBeenSigned(existingTransaction.id());
			const isAwaitingConfirmation = wallet.transaction().isAwaitingConfirmation(existingTransaction.id());
			const isAwaitingOurSignature = wallet.transaction().isAwaitingOurSignature(existingTransaction.id());
			const isAwaitingOtherSignatures = wallet.transaction().isAwaitingOtherSignatures(existingTransaction.id());
			const isPendingTransfer =
				!existingTransaction.usesMultiSignature() && (hasBeenSigned || isAwaitingConfirmation);

			// @ts-ignore
			pending.push({
				// @ts-ignore
				hasBeenSigned,
				// @ts-ignore
				isAwaitingConfirmation,
				// @ts-ignore
				isAwaitingOtherSignatures,
				// @ts-ignore
				isAwaitingOurSignature,
				// @ts-ignore
				isPendingTransfer,
				// @ts-ignore
				transaction,
			});
		}

		return pending;
	}, [pendingSigned, pendingTransfers, wallet]);

	const jobs = useMemo(
		() => [
			{
				callback: syncPending,
				interval: 5000,
			},
		],
		[syncPending],
	);

	const { start, stop } = useSynchronizer(jobs);

	const hasUnsignedPendingTransaction = useMemo(
		() => pendingTransactions.some(({ isAwaitingOurSignature }) => isAwaitingOurSignature),
		[pendingTransactions],
	);

	return {
		hasUnsignedPendingTransaction,
		isLoading,
		pendingTransactions,
		startSyncingPendingTransactions: start,
		stopSyncingPendingTransactions: stop,
	};
};
