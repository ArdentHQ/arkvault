import { useEffect, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";

export const useConfirmedTransaction = ({
	wallet,
	transactionId,
}: {
	wallet: Contracts.IReadWriteWallet;
	transactionId: string;
}): {
	isConfirmed: boolean;
} => {
	const [isConfirmed, setIsConfirmed] = useState(false);

	useEffect(() => {
		const checkConfirmed = async () => {
			const id = setInterval(async () => {
				try {
					await wallet.coin().client().transaction(transactionId);
					setIsConfirmed(true);
					clearInterval(id);
				} catch {
					// transaction is not forged yet, ignore the error
				}
			}, 1000);
		};

		void checkConfirmed();
	}, [wallet.id(), transactionId]);

	return isConfirmed;
};
