import { useEffect, useMemo, useState } from "react";
import { Contracts } from "@/app/lib/profiles";
import { ExtendedConfirmedTransactionData } from "@/app/lib/profiles/transaction.dto";
import { ConfirmedTransactionData } from "@/app/lib/mainsail/confirmed-transaction.dto";
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

	const tokenTransferData = useMemo(() => {
		if (tokenTransfer?.isTokenTransfer()) {
			const { value, token, type, data, to } = (tokenTransfer.data() as ConfirmedTransactionData).raw();

			return { data, to, token, type, value };
		}

		return {};
	}, [tokenTransfer]);

	useEffect(() => {
		if (!transactionId || !wallet) {
			return;
		}

		const checkConfirmed = (): void => {
			const id = setInterval(async () => {
				try {
					const confirmedTransactionData = await wallet.client().transaction(transactionId);

					const transaction = new ConfirmedTransactionData().configure({
						...confirmedTransactionData.raw(),
						...tokenTransferData,
					});

					setIsConfirmed(true);
					setTransaction(new ExtendedConfirmedTransactionData(wallet, transaction));
					clearInterval(id);
				} catch {
					// transaction is not forged yet, ignore the error
				}
			}, 1000);
		};

		void checkConfirmed();
	}, [wallet?.id(), transactionId, tokenTransferData]);

	return { isConfirmed, transaction };
};
