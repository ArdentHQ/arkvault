import { useEffect, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { interval } from "@/utils/interval";

export const useConfirmedTransaction = ({
	wallet,
	transactionId,
}: {
	wallet: Contracts.IReadWriteWallet;
	transactionId: string;
}): boolean => {
	const [isConfirmed, setIsConfirmed] = useState(false);

	useEffect(() => {
		const checkConfirmed = (): void => {
			const id = interval(async () => {
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
