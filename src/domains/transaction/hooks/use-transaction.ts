import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useCallback, useMemo } from "react";
import { migrationWalletAddress } from "@/utils/polygon-migration";

const isMigrationTransaction = (transaction: DTO.ExtendedConfirmedTransactionData) =>
	transaction.recipient() === migrationWalletAddress();

export const useTransaction = () => {
	const fetchWalletUnconfirmedTransactions = useCallback(async (wallet: Contracts.IReadWriteWallet) => {
		try {
			const transactionIndex = await wallet.transactionIndex().sent({ cursor: 1, limit: 20 });

			return transactionIndex
				.items()
				.filter(
					(transaction) =>
						!transaction.isConfirmed() && (transaction.isMultiPayment() || transaction.isTransfer()),
				);
		} catch {
			return [];
		}
	}, []);

	return useMemo(
		() => ({
			fetchWalletUnconfirmedTransactions,
			isMigrationTransaction,
		}),
		[fetchWalletUnconfirmedTransactions],
	);
};
