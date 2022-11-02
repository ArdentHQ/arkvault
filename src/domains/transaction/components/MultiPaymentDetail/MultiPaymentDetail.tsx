import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import {
	TransactionAmount,
	TransactionExplorerLink,
	TransactionFee,
	TransactionMemo,
	TransactionSender,
	TransactionStatus,
	TransactionTimestamp,
} from "@/domains/transaction/components/TransactionDetail";
import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetailModal/TransactionDetailModal.contracts";
import { TransactionDetailAddressList } from "@/domains/transaction/components/MultiPaymentDetail/components/TransactionDetailAddressList";

export const MultiPaymentDetail = ({ isOpen, transaction, aliases, onClose }: TransactionDetailProperties) => {
	const { t } = useTranslation();

	const wallet = useMemo(() => transaction.wallet(), [transaction]);

	const { recipients, returnedAmount } = useMemo(() => {
		const recipients: [] = [];
		let returnedAmount = 0;

		for (const [index, recipient] of transaction.recipients().entries()) {
			if (transaction.isReturn() && transaction.sender() === recipient.address) {
				returnedAmount += recipient.amount;
			}

			//@ts-ignore
			recipients.push({
				...recipient,
				// @ts-ignore
				alias: aliases?.recipients[index].alias,
				// @ts-ignore
				isDelegate: aliases?.recipients[index].isDelegate,
			});
		}

		return { recipients, returnedAmount };
	}, [aliases, transaction]);

	return (
		<Modal title={t("TRANSACTION.MODAL_TRANSFER_DETAIL.TITLE")} isOpen={isOpen} onClose={onClose} noButtons>
			<TransactionSender address={transaction.sender()} network={transaction.wallet().network()} border={false} />

			<TransactionDetailAddressList transaction={transaction} addresses={recipients} />

			<TransactionAmount
				amount={transaction.amount()}
				convertedAmount={transaction.convertedAmount()}
				returnedAmount={returnedAmount}
				currency={wallet.currency()}
				exchangeCurrency={wallet.exchangeCurrency()}
				isTotalAmount={true}
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

MultiPaymentDetail.displayName = "MultiPaymentDetail";
