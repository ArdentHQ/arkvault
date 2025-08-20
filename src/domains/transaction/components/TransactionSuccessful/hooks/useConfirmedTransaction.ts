import { useEffect, useState } from "react";
import { Contracts } from "@/app/lib/profiles";
import { ExtendedConfirmedTransactionData } from "@/app/lib/profiles/transaction.dto";

export const useConfirmedTransaction = ({
	wallet,
	transactionId,
}: {
	wallet: Contracts.IReadWriteWallet;
	transactionId: string;
}): { isConfirmed: boolean; transaction?: ExtendedConfirmedTransactionData } => {
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [transaction, setTransaction] = useState<ExtendedConfirmedTransactionData | undefined>(undefined);

	useEffect(() => {
		const checkConfirmed = (): void => {
			const id = setInterval(async () => {
				try {
					const transaction = await wallet.client().transaction(transactionId);
					setIsConfirmed(true);
					setTransaction(new ExtendedConfirmedTransactionData(wallet, transaction));
					clearInterval(id);
				} catch {
					// transaction is not forged yet, ignore the error
				}
			}, 1000);
		};

		void checkConfirmed();
	}, [wallet.id(), transactionId]);

	return { isConfirmed, transaction };
};
