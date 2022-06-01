import React from "react";
import { useTranslation } from "react-i18next";

import { Divider } from "@/app/components/Divider";
import { Image } from "@/app/components/Image";
import { Spinner } from "@/app/components/Spinner";

interface LedgerConfirmationProperties {
	children?: React.ReactNode;
	detailsHeading?: string;
	noHeading?: boolean;
}

export const LedgerConfirmation = ({ children, detailsHeading, noHeading }: LedgerConfirmationProperties) => {
	const { t } = useTranslation();

	return (
		<>
			<Image name="ConfirmTransactionLedgerBanner" domain="transaction" className="my-8 max-w-full" />

			<div className="mt-8 text-theme-secondary-text" data-testid="LedgerConfirmation-description">
				{t("TRANSACTION.LEDGER_CONFIRMATION.DESCRIPTION")}
			</div>

			<div className="mt-8 inline-flex w-full items-center justify-center space-x-3">
				<Spinner />
				<span
					className="font-semibold text-theme-secondary-900 dark:text-theme-secondary-600"
					data-testid="LedgerConfirmation-loading_message"
				>
					{t("TRANSACTION.LEDGER_CONFIRMATION.LOADING_MESSAGE")}
				</span>
			</div>

			{children && (
				<>
					<Divider />

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
