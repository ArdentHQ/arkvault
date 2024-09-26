import React from "react";
import { useTranslation } from "react-i18next";

import { Spinner } from "@/app/components/Spinner";
import { Icon } from "@/app/components/Icon";
import { Divider } from "@/app/components/Divider";
import { DTO } from "@ardenthq/sdk-profiles";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";

const isAwaitingSignatures = (transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData) => {
	if (transaction.isConfirmed() ?? !transaction.confirmations().isZero()) {
		return false
	}

	return !transaction.wallet().transaction().hasBeenBroadcasted(transaction.id())
}

export const TransactionConfirmations = ({
	isConfirmed,
	confirmations = 0,
	transaction
}: {
	isConfirmed: boolean;
	confirmations?: number;
	transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;
}) => {
	const { t } = useTranslation();


	const pendingStatusLabel = isAwaitingSignatures(transaction) ? t("TRANSACTION.MULTISIGNATURE.AWAITING_SUFFICIENT_SIGNATURES") : t("TRANSACTION.PENDING.STATUS_TEXT")

	return (
		<div className="mt-2">
			{!isConfirmed && (
				<div
					data-testid="PendingConfirmationAlert"
					className="flex items-center space-x-3 rounded-xl border border-theme-warning-200 bg-theme-warning-50 px-6 py-5 dark:border-theme-warning-600 dark:bg-transparent"
				>
					<Spinner color="warning-alt" size="sm" width={3} />
					<Divider type="vertical" className="text-theme-warning-200 dark:text-theme-secondary-800" />
					<p className="font-semibold text-theme-secondary-700 dark:text-theme-warning-600">
						{pendingStatusLabel}
					</p>
				</div>
			)}

			{isConfirmed && (
				<div
					data-testid="TransactionSuccessAlert"
					className="flex items-center space-x-3 rounded-xl border border-theme-success-200 bg-theme-success-50 px-6 py-5 dark:border-theme-success-600 dark:bg-transparent"
				>
					<div className="flex items-center space-x-2 text-theme-success-700">
						<Icon name="CheckmarkDouble" size="lg" />
						<p className="font-semibold">{t("COMMON.ALERT.SUCCESS")}</p>
					</div>

					<Divider type="vertical" className="text-theme-success-200 dark:text-theme-secondary-800" />

					<p className="font-semibold text-theme-secondary-700 dark:text-theme-success-600">
						<span>{t("TRANSACTION.CONFIRMATIONS_COUNT", { count: confirmations })} </span>
					</p>
				</div>
			)}
		</div>
	);
};
