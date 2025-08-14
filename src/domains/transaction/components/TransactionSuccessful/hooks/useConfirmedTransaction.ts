import { useEffect, useState } from "react";
import { Contracts } from "@/app/lib/profiles";

export const useConfirmedTransaction = ({
	wallet,
	transactionId,
}: {
	wallet?: Contracts.IReadWriteWallet;
	transactionId?: string;
}): { isConfirmed: boolean; confirmations: number } => {
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [confirmations, setConfirmations] = useState(0);

	useEffect(() => {
		if (!transactionId || !wallet) {
			return;
		}

		const checkConfirmed = (): void => {
			const id = setInterval(async () => {
				try {
					const transaction = await wallet.client().transaction(transactionId);
					setIsConfirmed(true);
					setConfirmations(transaction.confirmations().toNumber());
					clearInterval(id);
				} catch {
					// transaction is not forged yet, ignore the error
				}
			}, 1000);
		};

		void checkConfirmed();
	}, [wallet?.id(), transactionId]);

	return { confirmations, isConfirmed };
};
