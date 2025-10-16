import React from "react";
import { useTranslation } from "react-i18next";

import { LedgerTransactionOverview } from "./LedgerTransactionOverview";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { Icon } from "@/app/components/Icon";
import { SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";

export const LedgerTransactionErrorStep = ({
	onTryAgain,
	onClose,
	transfer,
}: {
	transfer: DraftTransfer;
	onTryAgain?: () => void;
	onClose?: () => void;
}) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<div
				data-testid="TransactionFailedAlert"
				className="border-theme-danger-200 bg-theme-danger-50 dark:border-theme-danger-info-border dim:border-theme-danger-400 dim:bg-theme-dim-900 rounded-xl border py-2 max-sm:text-sm sm:py-4 sm:leading-5 dark:bg-transparent"
			>
				<div className="mb-2 flex items-center space-x-3 px-3 sm:mb-4 sm:px-6">
					<div className="text-theme-danger-700 dark:text-theme-danger-info-border dim:text-theme-danger-400 flex items-center space-x-2">
						<Icon name="CircleCross" size="lg" className="h-5" />
						<p className="font-semibold">{t("COMMON.ALERT.FAILED")}</p>
					</div>
				</div>

				<p className="border-theme-danger-200 text-theme-secondary-700 dark:border-theme-secondary-800 dark:text-theme-secondary-500 dim:text-theme-dim-200 dim:border-theme-danger-400 border-t px-3 pt-2 font-semibold sm:px-6 sm:pt-4">
					{t("COMMON.LEDGER_MIGRATION.LEDGER_REJECTED_TRANSACTION")}
				</p>
			</div>

			<LedgerTransactionOverview transfer={transfer}>
				<SidepanelFooter className="fixed right-0 bottom-0">
					<div className="flex items-center space-x-5 justify-end">
						<Button
							variant="secondary"
							data-testid="LedgerScanStep__continue-button"
							onClick={onClose}
						>
							{t("COMMON.CLOSE")}
						</Button>

						<Button
							data-testid="LedgerScanStep__continue-button"
							onClick={onTryAgain}
						>
							{t("COMMON.TRY_AGAIN")}
						</Button>
					</div>
				</SidepanelFooter>
			</LedgerTransactionOverview>
		</div>
	);
};
