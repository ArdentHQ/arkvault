import React from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/app/components/Spinner";
import { Image } from "@/app/components/Image";

export const LedgerCancelling = () => {
	const { t } = useTranslation();
	return (
		<div className="space-y-8" data-testid="LedgerCancellingScreen">
			<Image name="ErrorTransactionLedgerBanner" domain="transaction" className="mx-auto max-w-full" />

			<div className="inline-flex justify-center items-center space-x-3 w-full">
				<Spinner />
				<span className="font-semibold animate-pulse text-theme-secondary-text">
					{t("WALLETS.PAGE_IMPORT_WALLET.CANCELLING_STATE.TITLE")}
				</span>
			</div>
		</div>
	);
};
