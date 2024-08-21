import { useEffect, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";

export const useConfirmedTransaction = ({
	wallet,
	transactionId,
}: {
	wallet: Contracts.IReadWriteWallet;
	transactionId: string;
}): { isConfirmed: boolean; confirmations: number } => {
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [confirmations, setConfirmations] = useState(0);

	useEffect(() => {
		const checkConfirmed = (): void => {
			const id = setInterval(async () => {
				try {
					const transaction = await wallet.coin().client().transaction(transactionId);
					setIsConfirmed(true);
					setConfirmations(transaction.confirmations().toNumber());
					clearInterval(id);
				} catch {
					// transaction is not forged yet, ignore the error
				}
			}, 1000);
		};

		void checkConfirmed();
	}, [wallet.id(), transactionId]);

	return { confirmations, isConfirmed };
};
