import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import {
	TransactionAmount,
	TransactionExplorerLink,
	TransactionFee,
	TransactionSender,
	TransactionStatus,
	TransactionTimestamp,
} from "@/domains/transaction/components/TransactionDetail";
import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetailModal/TransactionDetailModal.contracts";

export const UnlockTokenDetail = ({ isOpen, transaction, onClose }: TransactionDetailProperties) => {
	const { t } = useTranslation();

	const wallet = useMemo(() => transaction.wallet(), [transaction]);
	const timestamp = useMemo(() => transaction.timestamp(), [transaction]);

	return (
		<Modal title={t("TRANSACTION.TRANSACTION_TYPES.UNLOCK_TOKEN")} isOpen={isOpen} onClose={onClose} noButtons>
			<TransactionSender address={transaction.sender()} network={transaction.wallet().network()} border={false} />

			<TransactionAmount
				amount={transaction.amount()}
				convertedAmount={transaction.convertedAmount()}
				currency={wallet.currency()}
				exchangeCurrency={wallet.exchangeCurrency()}
				isSent={transaction.isSent()}
			/>

			<TransactionFee
				currency={wallet.currency()}
				value={transaction.fee()}
				convertedValue={transaction.convertedFee()}
				exchangeCurrency={wallet.exchangeCurrency()}
			/>

			{!!timestamp && <TransactionTimestamp timestamp={timestamp} />}

			<TransactionStatus transaction={transaction} />

			<TransactionExplorerLink transaction={transaction} />
		</Modal>
	);
};
