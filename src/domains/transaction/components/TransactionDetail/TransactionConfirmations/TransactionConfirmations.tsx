import React from "react";
import { useTranslation } from "react-i18next";

import { Spinner } from "@/app/components/Spinner";
import { Icon } from "@/app/components/Icon";
import { Divider } from "@/app/components/Divider";

export const TransactionConfirmations = ({
	isConfirmed,
	confirmations,
}: {
	isConfirmed: boolean;
	confirmations?: number;
}) => {
	const { t } = useTranslation();

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
						{t("TRANSACTION.PENDING.STATUS_TEXT")}
					</p>
				</div>
			)}

			{isConfirmed && (
				<div
					data-testid="TransactionSuccessAlert"
					className="flex items-center space-x-3 rounded-xl border border-theme-success-200 bg-theme-success-50 px-6 py-5 dark:border-theme-success-600 dark:bg-transparent"
				>
					<div className="flex items-center space-x-2 text-theme-success-600">
						<Icon name="CheckmarkDouble" />
						<p>{t("COMMON.ALERT.SUCCESS")}</p>
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
