import { useEffect, useRef, useState } from "react";
import { Contracts } from "@/app/lib/profiles";
import { ExtendedConfirmedTransactionData } from "@/app/lib/profiles/transaction.dto";
import { ExtendedTransactionDTO } from "@/domains/transaction/components/TransactionTable";

export const useConfirmedTransaction = ({
	wallet,
	transactionId,
	disabled,
}: {
	wallet?: Contracts.IReadWriteWallet;
	transactionId?: string;
	disabled?: boolean;
}): { isConfirmed: boolean; isLoading: boolean; transaction?: ExtendedConfirmedTransactionData } => {
	const [isLoading, setIsLoading] = useState(false);
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [transaction, setTransaction] = useState<ExtendedConfirmedTransactionData | undefined>(undefined);

	const intervalId = useRef<NodeJS.Timeout | undefined>(undefined);

	useEffect(() => {
		if (!transactionId || !wallet || disabled) {
			return;
		}

		const checkConfirmed = (): void => {
			setIsLoading(true);

			intervalId.current = setInterval(async () => {
				try {
					const transaction = await wallet.client().transaction(transactionId);
					setIsConfirmed(true);

					setIsLoading(false);
					setTransaction(new ExtendedConfirmedTransactionData(wallet, transaction));

					clearInterval(intervalId.current);
				} catch {
					// transaction is not forged yet, ignore the error
				}
			}, 1000);
		};

		void checkConfirmed();

		return () => {
			setIsConfirmed(false);
			setTransaction(undefined);
			clearInterval(intervalId.current);
		};
	}, [wallet?.id(), transactionId, disabled]);

	return { isConfirmed, isLoading, transaction };
};
