import React from "react";
import { useTranslation } from "react-i18next";

import { Image } from "@/app/components/Image";
import { Spinner } from "@/app/components/Spinner";

export const LedgerCancelling = () => {
	const { t } = useTranslation();
	return (
		<div className="space-y-8" data-testid="LedgerCancellingScreen">
			<Image name="ErrorTransactionLedgerBanner" domain="transaction" className="mx-auto max-w-full" />

			<div className="inline-flex w-full items-center justify-center space-x-3">
				<Spinner />
				<span className="animate-pulse font-semibold text-theme-secondary-text">
					{t("WALLETS.PAGE_IMPORT_WALLET.CANCELLING_STATE.TITLE")}
				</span>
			</div>
		</div>
	);
};
