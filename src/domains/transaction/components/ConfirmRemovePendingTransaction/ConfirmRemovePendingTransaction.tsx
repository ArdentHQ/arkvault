import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DeleteResource } from "@/app/components/DeleteResource";
import { Form } from "@/app/components/Form";
import { useForm } from "react-hook-form";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { useLedgerContext } from "@/app/contexts";

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

	const { hasDeviceAvailable, isConnected, connect, ledgerDevice } = useLedgerContext();

	const form = useForm({ mode: "onChange" });

	const { formState } = form;
	const { isSubmitting, isValid } = formState;

	if (!transaction?.type()) {
		return <></>;
	}

	const wallet = transaction.wallet();

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
			disabled={isSubmitting || !isValid}
			onClose={onClose}
			onCancel={onClose}
			onDelete={() => onRemove?.(transaction)}
		>
			<Form context={form} className="mt-6">
				{wallet.isLedger() && (
					<span>TODO</span>
				)}

				{!wallet.isLedger() && (
					<AuthenticationStep
						wallet={wallet}
						ledgerIsAwaitingDevice={!hasDeviceAvailable}
						ledgerIsAwaitingApp={!isConnected}
						ledgerConnectedModel={ledgerDevice?.id}
						ledgerSupportedModels={[Contracts.WalletLedgerModel.NanoX]}
						subject="message"
						showHeader={false}
					/>
				)}
			</Form>
		</DeleteResource>
	);
};
