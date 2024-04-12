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
import { isMainsailNetwork } from "@/utils/network-utils";
import { useTranslation } from "react-i18next";

export const DelegateRegistrationDetail = ({ isOpen, transaction, onClose }: TransactionDetailProperties) => {
	const { t } = useTranslation();

	const wallet = useMemo(() => transaction.wallet(), [transaction]);

	return (
		<Modal
			title={t("TRANSACTION.MODAL_DELEGATE_REGISTRATION_DETAIL.TITLE")}
			isOpen={isOpen}
			onClose={onClose}
			noButtons
		>
			<TransactionSender address={transaction.sender()} network={transaction.wallet().network()} border={false} />

			{isMainsailNetwork(wallet.network()) && (
				<TransactionDetail label={t("TRANSACTION.VALIDATOR_PUBLIC_KEY")}>
					{transaction.asset()?.validatorPublicKey as string}
				</TransactionDetail>
			)}

			{!isMainsailNetwork(wallet.network()) && (
				<TransactionDetail label={t("TRANSACTION.DELEGATE_NAME")} extra={<TransactionDelegateIcon />}>
					{transaction.username}
				</TransactionDetail>
			)}

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} />

			<TransactionTimestamp timestamp={transaction.timestamp()} />

			<TransactionStatus transaction={transaction} />

			<TransactionExplorerLink transaction={transaction} />
		</Modal>
	);
};

DelegateRegistrationDetail.displayName = "DelegateRegistrationDetail";
