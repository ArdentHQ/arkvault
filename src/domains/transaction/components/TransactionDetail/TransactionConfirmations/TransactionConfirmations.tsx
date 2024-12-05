import React from "react";
import { useTranslation } from "react-i18next";

import { Spinner } from "@/app/components/Spinner";
import { Icon } from "@/app/components/Icon";
import { Divider } from "@/app/components/Divider";
import { DTO } from "@ardenthq/sdk";
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

	if (confirmations && confirmations > 1 && !transaction.isSuccess()) {
		return (
			<div
				data-testid="TransactionFailedAlert"
				className="rounded-xl border border-theme-danger-200 bg-theme-danger-50 py-2 dark:border-theme-danger-info-border dark:bg-transparent max-sm:text-sm sm:py-4 sm:leading-5"
			>
				<div className="flex items-center space-x-3 px-3 sm:px-6">
					<div className="flex items-center space-x-2 text-theme-danger-700 dark:text-theme-danger-info-border">
						<Icon name="CircleMinus" size="lg" className="h-5" />
						<p className="font-semibold">{t("COMMON.ALERT.FAILED")}</p>
					</div>

					<Divider type="vertical" className="h-5 text-theme-danger-200 dark:text-theme-secondary-800" />

					<p className="font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
						<span>{t("TRANSACTION.CONFIRMATIONS_COUNT", { count: confirmations })} </span>
					</p>
				</div>

				<Divider type="horizontal" className="text-theme-danger-200 dark:text-theme-secondary-800" />

				<p className="px-3 font-semibold text-theme-secondary-700 dark:text-theme-secondary-500 sm:px-6">
					{t("TRANSACTION.TRANSACTION_EXECUTION_ERROR")}
				</p>
			</div>
		);
	}

	return (
		<div className="mt-3 sm:mt-2">
			{!isConfirmed && (
				<div
					data-testid="PendingConfirmationAlert"
					className="flex items-center space-x-3 rounded-xl border border-theme-warning-200 bg-theme-warning-50 px-3 py-2 dark:border-theme-warning-600 dark:bg-transparent max-sm:text-sm sm:px-6 sm:py-4 sm:leading-5"
				>
					<Spinner color="warning-alt" size="sm" width={3} />
					<Divider type="vertical" className="h-5 text-theme-warning-200 dark:text-theme-secondary-800" />
					<p className="font-semibold text-theme-secondary-700 dark:text-theme-warning-600">
						{status.value === "isBroadcasted" ? t("TRANSACTION.PENDING.STATUS_TEXT") : status.label}
					</p>
				</div>
			)}

			{isConfirmed && (
				<div
					data-testid="TransactionSuccessAlert"
					className="flex items-center space-x-3 rounded-xl border border-theme-success-200 bg-theme-success-50 px-3 py-2 dark:border-theme-success-600 dark:bg-transparent max-sm:text-sm sm:px-6 sm:py-4 sm:leading-5"
				>
					<div className="flex items-center space-x-2 text-theme-success-700">
						<Icon name="CheckmarkDouble" size="lg" className="h-5" />
						<p className="font-semibold">{t("COMMON.ALERT.SUCCESS")}</p>
					</div>

					<Divider type="vertical" className="h-5 text-theme-success-200 dark:text-theme-secondary-800" />

					<p className="font-semibold text-theme-secondary-700 dark:text-theme-success-600">
						<span>{t("TRANSACTION.CONFIRMATIONS_COUNT", { count: confirmations })} </span>
					</p>
				</div>
			)}
		</div>
	);
};
