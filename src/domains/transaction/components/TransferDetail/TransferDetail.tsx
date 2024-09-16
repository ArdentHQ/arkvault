import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import {
	TransactionAddresses,
	TransactionAmount,
	TransactionExplorerLink,
	TransactionFee,
	TransactionMemo,
	TransactionRecipients,
	TransactionSender,
	TransactionStatus,
	TransactionTimestamp,
} from "@/domains/transaction/components/TransactionDetail";
import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetailModal/TransactionDetailModal.contracts";
import { TransactionId } from "../TransactionDetail/TransactionId";

export const TransferDetail = ({ isOpen, aliases, transaction, onClose }: TransactionDetailProperties) => {
	const { t } = useTranslation();
	const wallet = useMemo(() => transaction.wallet(), [transaction]);
	console.log({ aliases })

	return (
		<Modal title={t("TRANSACTION.MODAL_TRANSFER_DETAIL.TITLE")} isOpen={isOpen} onClose={onClose} noButtons>
			<TransactionId transaction={transaction} />

			<TransactionAddresses senderWallet={transaction.wallet()}
				recipients={[
					{
						address: transaction.recipient(),
						alias: aliases?.recipients[0].alias,
						isDelegate: aliases?.recipients[0].isDelegate,
					},
				]}
			/>

			<TransactionRecipients
				label={t("TRANSACTION.RECIPIENTS_COUNT", { count: 1 })}
				currency={wallet.currency()}
				recipients={[
					{
						address: transaction.recipient(),
						alias: aliases?.recipients[0].alias,
						isDelegate: aliases?.recipients[0].isDelegate,
					},
				]}
			/>

			<TransactionAmount
				amount={transaction.amount()}
				convertedAmount={transaction.convertedAmount()}
				currency={wallet.currency()}
				exchangeCurrency={wallet.exchangeCurrency()}
				isSent={transaction.isSent()}
			/>

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} />

			{transaction.memo() && <TransactionMemo memo={transaction.memo()} />}

			<TransactionTimestamp timestamp={transaction.timestamp()} />

			<TransactionStatus transaction={transaction} />

			<TransactionExplorerLink transaction={transaction} />
		</Modal>
	);
};

TransferDetail.displayName = "TransferDetail";
