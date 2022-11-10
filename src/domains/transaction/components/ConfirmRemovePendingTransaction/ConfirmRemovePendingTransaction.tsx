import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DeleteResource } from "@/app/components/DeleteResource";
import { Form } from "@/app/components/Form";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { useLedgerContext } from "@/app/contexts";

interface ConfirmRemovePendingTransactionProperties {
	profile: Contracts.IProfile;
	transaction: DTO.ExtendedSignedTransactionData;
	onClose?: any;
	onRemove?: (transaction: DTO.ExtendedSignedTransactionData) => void;
}

export const ConfirmRemovePendingTransaction = ({
	profile,
	onClose,
	onRemove,
	transaction,
}: ConfirmRemovePendingTransactionProperties) => {
	const { t } = useTranslation();
	const { getLabel } = useTransactionTypes();

	const [hasLedgerPublicKey, setHasLedgerPublicKey] = useState(false);
	const { hasDeviceAvailable, isConnected, connect, ledgerDevice } = useLedgerContext();

	const wallet = transaction.wallet();

	useEffect(() => {
		const getPublicKey = async () => {
			try {
				await connect(profile, transaction.wallet().coinId(), transaction.wallet().networkId());

				const path = wallet.data().get<string>(Contracts.WalletData.DerivationPath);
				const publicKey = await wallet.coin().ledger().getPublicKey(path!);

				setHasLedgerPublicKey(publicKey === wallet.publicKey());
			} catch {
				//
			}
		};

		if (wallet.isLedger()) {
			getPublicKey();
		}
	}, [connect, profile, wallet]);

	const form = useForm({ mode: "onChange" });

	const { formState } = form;
	const { isSubmitting, isValid } = formState;

	if (!transaction.type()) {
		return <></>;
	}

	const typeLabel = getLabel(transaction.type());
	const typeSuffix = transaction.isMultiSignatureRegistration()
		? t("TRANSACTION.REGISTRATION")
		: t("TRANSACTION.TRANSACTION");

	const isButtonDisabled = () => {
		if (isSubmitting) {
			return true;
		}

		return wallet.isLedger() ? !hasLedgerPublicKey : !isValid;
	};

	return (
		<DeleteResource
			data-testid={`ConfirmRemovePendingTransaction__${typeLabel}-${typeSuffix}`}
			title={t("TRANSACTION.MODAL_CONFIRM_REMOVE_PENDING_TRANSACTION.TITLE")}
			description={t("TRANSACTION.MODAL_CONFIRM_REMOVE_PENDING_TRANSACTION.DESCRIPTION", {
				type: `${typeLabel} ${typeSuffix}`,
			})}
			disabled={isButtonDisabled()}
			onClose={onClose}
			onCancel={onClose}
			onDelete={() => onRemove?.(transaction)}
			isOpen
		>
			<Form context={form}>
				{(!wallet.isLedger() || !hasLedgerPublicKey) && (
					<div className="mt-6">
						<AuthenticationStep
							wallet={wallet}
							ledgerIsAwaitingDevice={!hasDeviceAvailable}
							ledgerIsAwaitingApp={!isConnected}
							ledgerConnectedModel={ledgerDevice?.id}
							ledgerSupportedModels={[Contracts.WalletLedgerModel.NanoX]}
							onDeviceNotAvailable={onClose}
							subject="message"
							noHeading={true}
							requireLedgerConfirmation={false}
						/>
					</div>
				)}
			</Form>
		</DeleteResource>
	);
};
