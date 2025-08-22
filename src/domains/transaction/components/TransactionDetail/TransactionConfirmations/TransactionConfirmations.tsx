import React from "react";
import { useTranslation } from "react-i18next";

import { Spinner } from "@/app/components/Spinner";
import { Icon } from "@/app/components/Icon";
import { Divider } from "@/app/components/Divider";
import { DTO } from "@/app/lib/mainsail";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";

export const TransactionConfirmations = ({
	isConfirmed,
	confirmations,
	transaction,
}: {
	isConfirmed: boolean;
	confirmations?: number;
	transaction: DTO.RawTransactionData;
}) => {
	const { t } = useTranslation();
	const { status } = useMultiSignatureStatus({ transaction, wallet: transaction.wallet() });

	const hasFailed = !!(confirmations && confirmations > 0 && "isSuccess" in transaction && !transaction.isSuccess());

	if (hasFailed) {
		return (
			<div
				data-testid="TransactionFailedAlert"
				className="border-theme-danger-200 bg-theme-danger-50 dark:border-theme-danger-info-border dim:border-theme-danger-400 dim:bg-theme-dim-900 rounded-xl border py-2 max-sm:text-sm sm:py-4 sm:leading-5 dark:bg-transparent"
			>
				<div className="mb-2 flex items-center space-x-3 px-3 sm:mb-4 sm:px-6">
					<div className="text-theme-danger-700 dark:text-theme-danger-info-border dim:text-theme-danger-400 flex items-center space-x-2">
						<Icon name="CircleCross" size="lg" className="h-5" />
						<p className="font-semibold">{t("COMMON.ALERT.FAILED")}</p>
					</div>

					<Divider
						type="vertical"
						className="text-theme-danger-200 dark:text-theme-secondary-800 dim:text-theme-dim-700 h-5"
					/>

					<p className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 font-semibold">
						<span>{t("TRANSACTION.CONFIRMATIONS_COUNT", { count: confirmations })} </span>
					</p>
				</div>

				{transaction.data().receipt().hasUnknownError() && (
					<p className="border-theme-danger-200 text-theme-secondary-700 dark:border-theme-secondary-800 dark:text-theme-secondary-500 dim:text-theme-dim-200 dim:border-theme-danger-400 border-t px-3 pt-2 font-semibold sm:px-6 sm:pt-4">
						{t("TRANSACTION.TRANSACTION_EXECUTION_ERROR")}
					</p>
				)}

				{transaction.data().receipt().error() && (
					<p className="border-theme-danger-200 text-theme-secondary-700 dark:border-theme-secondary-800 dark:text-theme-secondary-500 dim:text-theme-dim-200 dim:border-theme-danger-400 border-t px-3 pt-2 font-semibold sm:px-6 sm:pt-4">
						{t("TRANSACTION.TRANSACTION_EXECUTION_ERROR_WITH_MESSAGE", { error: transaction.data().receipt().error().replace(/([A-Z])/g, ' $1') })}
					</p>
				)}

				{transaction.data().receipt().hasInsufficientGasError() && (
					<p className="border-theme-danger-200 text-theme-secondary-700 dark:border-theme-secondary-800 dark:text-theme-secondary-500 dim:text-theme-dim-200 dim:border-theme-danger-400 border-t px-3 pt-2 font-semibold sm:px-6 sm:pt-4">
						{t("TRANSACTION.TRANSACTION_EXECUTION_ERROR_INSUFFICIENT_GAS")}
					</p>
				)}
			</div>
		);
	}

	return (
		<div className="mt-3 sm:mt-2">
			{!isConfirmed && (
				<div
					data-testid="PendingConfirmationAlert"
					className="border-theme-warning-200 bg-theme-warning-50 dark:border-theme-warning-600 dim:border-theme-warning-600 dim:bg-theme-dim-900 flex items-center space-x-3 rounded-xl border px-3 py-2 max-sm:text-sm sm:px-6 sm:py-4 sm:leading-5 dark:bg-transparent"
				>
					<Spinner color="warning-alt" size="sm" width={3} />
					<Divider
						type="vertical"
						className="text-theme-warning-200 dark:text-theme-secondary-800 dim:text-theme-dim-700 h-5"
					/>
					<p className="text-theme-secondary-700 dark:text-theme-warning-600 dim:text-theme-dim-200 font-semibold">
						{status.value === "isBroadcasted" ? t("TRANSACTION.PENDING.STATUS_TEXT") : status.label}
					</p>
				</div>
			)}

			{isConfirmed && (
				<div
					data-testid="TransactionSuccessAlert"
					className="border-theme-success-200 bg-theme-success-50 dark:border-theme-success-600 dim:border-theme-success-500 dim:bg-theme-success-900 flex items-center space-x-3 rounded-xl border px-3 py-2 max-sm:text-sm sm:px-6 sm:py-4 sm:leading-5 dark:bg-transparent"
				>
					<div className="text-theme-success-700 dim:text-theme-success-500 flex items-center space-x-2">
						<Icon name="CheckmarkDouble" size="lg" className="h-5" />
						<p className="text-sm font-semibold sm:text-base">{t("COMMON.ALERT.SUCCESS")}</p>
					</div>

					<Divider
						type="vertical"
						className="text-theme-success-200 dark:text-theme-secondary-800 dim:text-theme-success-800 h-5"
					/>

					<p className="text-theme-secondary-700 dark:text-theme-success-600 dim:text-theme-dim-50 text-sm font-semibold sm:text-base">
						<span>{t("TRANSACTION.CONFIRMATIONS_COUNT", { count: confirmations })} </span>
					</p>
				</div>
			)}
		</div>
	);
};
