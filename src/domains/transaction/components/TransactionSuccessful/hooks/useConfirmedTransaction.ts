import { useEffect, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";

export const useConfirmedTransaction = ({
	wallet,
	transactionId,
}: {
	wallet: Contracts.IReadWriteWallet;
	transactionId: string;
}): boolean => {
	const [isConfirmed, setIsConfirmed] = useState(false);

	useEffect(() => {
		const checkConfirmed = (): number => {
			return setInterval(async () => {
				try {
					const transaction = wallet.transaction().transaction(transactionId)

					if(transaction.isMultiSignatureRegistration() || wallet.isMultiSignature()) {
						return
					}

					await wallet.coin().client().transaction(transactionId);
					setIsConfirmed(true);
					clearInterval(id);
				} catch {
					// transaction is not forged yet, ignore the error
				}
			}, 1000);
		};

		const id = checkConfirmed();

		return () => {
			clearInterval(id)
		}
	}, [wallet.id(), transactionId]);

	return isConfirmed;
};
