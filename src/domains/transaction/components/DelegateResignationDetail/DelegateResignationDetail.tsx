import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import {
	TransactionDetail,
	TransactionExplorerLink,
	TransactionFee,
	TransactionSender,
	TransactionStatus,
	TransactionTimestamp,
} from "@/domains/transaction/components/TransactionDetail";
import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetailModal/TransactionDetailModal.contracts";
import { TransactionDelegateResignationIcon } from "@/domains/transaction/components/TransactionDetail/TransactionResponsiveIcon/TransactionResponsiveIcon";
import { selectDelegateValidatorTranslation } from "@/domains/wallet/utils/selectDelegateValidatorTranslation";

export const DelegateResignationDetail = ({ isOpen, transaction, onClose }: TransactionDetailProperties) => {
	const { t } = useTranslation();

	const wallet = useMemo(() => transaction.wallet(), [transaction]);

	return (
		<Modal
			title={selectDelegateValidatorTranslation({
				delegateStr: t("TRANSACTION.MODAL_DELEGATE_RESIGNATION_DETAIL.TITLE"),
				network: wallet.network(),
				validatorStr: t("TRANSACTION.MODAL_VALIDATOR_RESIGNATION_DETAIL.TITLE"),
			})}
			isOpen={isOpen}
			onClose={onClose}
			noButtons
		>
			<TransactionSender address={transaction.sender()} network={transaction.wallet().network()} border={false} />

			<TransactionDetail
				label={selectDelegateValidatorTranslation({
					delegateStr: t("TRANSACTION.DELEGATE_NAME"),
					network: wallet.network(),
					validatorStr: t("TRANSACTION.VALIDATOR_NAME"),
				})}
				extra={<TransactionDelegateResignationIcon />}
			>
				{wallet.username()}
			</TransactionDetail>

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} />

			<TransactionTimestamp timestamp={transaction.timestamp()} />

			<TransactionStatus transaction={transaction} />

			<TransactionExplorerLink transaction={transaction} />
		</Modal>
	);
};

DelegateResignationDetail.displayName = "DelegateResignationDetail";
