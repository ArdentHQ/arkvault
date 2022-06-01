import { DTO } from "@payvo/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DeleteResource } from "@/app/components/DeleteResource";

interface ConfirmSendTransactionProperties {
	isOpen: boolean;
	onClose?: any;
	onRemove?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	transaction?: DTO.ExtendedSignedTransactionData;
}

export const ConfirmRemovePendingTransaction = ({
	isOpen,
	onClose,
	onRemove,
	transaction,
}: ConfirmSendTransactionProperties) => {
	const { t } = useTranslation();
	const { getLabel } = useTransactionTypes();

	if (!transaction?.type()) {
		return <></>;
	}

	const typeLabel = getLabel(transaction.type());
	const typeSuffix = transaction.isMultiSignatureRegistration()
		? t("TRANSACTION.REGISTRATION")
		: t("TRANSACTION.TRANSACTION");

	return (
		<DeleteResource
			data-testid={`ConfirmRemovePendingTransaction__${typeLabel}-${typeSuffix}`}
			isOpen={isOpen}
			title={t("TRANSACTION.MODAL_CONFIRM_REMOVE_PENDING_TRANSACTION.TITLE")}
			description={t("TRANSACTION.MODAL_CONFIRM_REMOVE_PENDING_TRANSACTION.DESCRIPTION", {
				type: `${typeLabel} ${typeSuffix}`,
			})}
			onClose={onClose}
			onCancel={onClose}
			onDelete={() => onRemove?.(transaction)}
		/>
	);
};
