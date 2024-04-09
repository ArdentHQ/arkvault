import React, { useMemo } from "react";
import {
	TransactionDetail,
	TransactionExplorerLink,
	TransactionFee,
	TransactionSender,
	TransactionStatus,
	TransactionTimestamp,
} from "@/domains/transaction/components/TransactionDetail";

import { Modal } from "@/app/components/Modal";
import { TransactionDelegateIcon } from "@/domains/transaction/components/TransactionDetail/TransactionResponsiveIcon/TransactionResponsiveIcon";
import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetailModal/TransactionDetailModal.contracts";
import { useTranslation } from "react-i18next";

export const UsernameRegistrationDetail = ({ isOpen, transaction, onClose }: TransactionDetailProperties) => {
	const { t } = useTranslation();

	const wallet = useMemo(() => transaction.wallet(), [transaction]);

	return (
		<Modal
			title={t("TRANSACTION.MODAL_USERNAME_REGISTRATION_DETAIL.TITLE")}
			isOpen={isOpen}
			onClose={onClose}
			noButtons
		>
			<TransactionSender address={transaction.sender()} network={transaction.wallet().network()} border={false} />

			{/* @TODO: Use new icons for username registration & resignation types when available.
				@see https://app.clickup.com/t/86dt6ymku */}
			<TransactionDetail label={t("TRANSACTION.USERNAME")} extra={<TransactionDelegateIcon />}>
				{transaction.username()}
			</TransactionDetail>

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} />

			<TransactionTimestamp timestamp={transaction.timestamp()} />

			<TransactionStatus transaction={transaction} />

			<TransactionExplorerLink transaction={transaction} />
		</Modal>
	);
};

UsernameRegistrationDetail.displayName = "UsernameRegistrationDetail";
