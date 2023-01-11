import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useCallback, useMemo } from "react";

// TODO: remove hardcoded value.
const migrationAddress = () => "DNBURNBURNBURNBRNBURNBURNBURKz8StY";

const isMigrationTransaction = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	return transaction.recipient() === migrationAddress();
};

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
