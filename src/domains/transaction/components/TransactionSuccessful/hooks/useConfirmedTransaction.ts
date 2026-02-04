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
}): { isConfirmed: boolean; transaction?: ExtendedConfirmedTransactionData } => {
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [transaction, setTransaction] = useState<ExtendedConfirmedTransactionData | undefined>(undefined);

	useEffect(() => {
		if (!transactionId || !wallet) {
			return;
		}

		const checkConfirmed = (): void => {
			const id = setInterval(async () => {
				try {
					if (tokenTransfer instanceof ExtendedConfirmedTransactionData && tokenTransfer.isTokenTransfer()) {
						await tokenTransfer.sync(wallet.profile());
						setTransaction(tokenTransfer);
					} else {
						const transaction = await wallet.client().transaction(transactionId);
						setTransaction(new ExtendedConfirmedTransactionData(wallet, transaction));
					}

					setIsConfirmed(true);
					clearInterval(id);
				} catch {
					// transaction is not forged yet, ignore the error
				}
			}, 1000);
		};

		void checkConfirmed();
	}, [wallet?.id(), transactionId]);

	return { isConfirmed, transaction };
};
