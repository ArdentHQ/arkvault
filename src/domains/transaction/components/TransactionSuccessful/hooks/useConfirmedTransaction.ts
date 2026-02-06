import { useEffect, useState } from "react";
import { Contracts } from "@/app/lib/profiles";
import { ExtendedConfirmedTransactionData } from "@/app/lib/profiles/transaction.dto";
import { ExtendedTransactionDTO } from "@/domains/transaction/components/TransactionTable";

export const useConfirmedTransaction = ({
	wallet,
	transactionId,
	tokenTransfer,
}: {
	wallet?: Contracts.IReadWriteWallet;
	transactionId?: string;
	tokenTransfer?: ExtendedTransactionDTO;
}): { isConfirmed: boolean; isLoading: boolean; transaction?: ExtendedConfirmedTransactionData } => {
	const [isLoading, setIsLoading] = useState(false);
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [transaction, setTransaction] = useState<ExtendedConfirmedTransactionData | undefined>(undefined);

	useEffect(() => {
		if (!transactionId || !wallet) {
			return;
		}

		const checkConfirmed = (): void => {
			setIsLoading(true);

			const id = setInterval(async () => {
				try {
					await (tokenTransfer as ExtendedConfirmedTransactionData).sync();
					setTransaction(tokenTransfer as ExtendedConfirmedTransactionData);

					setIsLoading(false);
					setIsConfirmed(true);
					clearInterval(id);
				} catch {
					// transaction is not forged yet, ignore the error
				}
			}, 1000);
		};

		void checkConfirmed();
	}, [wallet?.id(), transactionId]);

	return { isConfirmed, isLoading, transaction };
};
