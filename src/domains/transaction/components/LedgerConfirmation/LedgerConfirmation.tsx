import { Divider } from "@/app/components/Divider";
import { Spinner } from "@/app/components/Spinner";
import React from "react";
import { useTranslation } from "react-i18next";

interface LedgerConfirmationProperties {
	children?: React.ReactNode;
	detailsHeading?: string;
	noHeading?: boolean;
}

export const LedgerConfirmation = ({ children, detailsHeading, noHeading }: LedgerConfirmationProperties) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="space-y-5">
				<div className="text-theme-secondary-text" data-testid="LedgerConfirmation-description">
					{t("TRANSACTION.LEDGER_CONFIRMATION.DESCRIPTION")}
				</div>

				<div
					data-testid="LedgerConfirmation-loading_message"
					className="flex items-center space-x-3 rounded-xl border border-theme-warning-200 bg-theme-warning-50 px-6 py-5 dark:border-theme-warning-600 dark:bg-transparent"
				>
					<Spinner color="warning-alt" size="sm" width={3} />
					<Divider type="vertical" className="text-theme-warning-200 dark:text-theme-secondary-800" />
					<p className="font-semibold text-theme-secondary-700 dark:text-theme-warning-600">
						{t("TRANSACTION.PENDING.STATUS_TEXT")}
					</p>
				</div>
			</div>

			{children && (
				<>
					<section data-testid="LedgerReview__details">
						{!noHeading && (
							<h2 className="mb-0 text-2xl font-bold">
								{detailsHeading || t("TRANSACTION.TRANSACTION_DETAILS")}
							</h2>
						)}
						{children}
					</section>
				</>
			)}
		</>
	);
};
