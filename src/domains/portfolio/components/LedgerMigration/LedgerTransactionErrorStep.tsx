import React from "react";
import { useTranslation } from "react-i18next";

import { LedgerTransactionOverview } from "./LedgerTransactionOverview";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Error } from "@/app/components/AlertBanner";

export const LedgerTransactionErrorStep = ({
	onTryAgain,
	onClose,
	transfer,
	migrator,
}: {
	transfer: DraftTransfer;
	onTryAgain?: () => void;
	onClose?: () => void;
	migrator;
}) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<Error title={t("COMMON.ALERT.FAILED")}>{t("COMMON.LEDGER_MIGRATION.LEDGER_REJECTED_TRANSACTION")}</Error>

			<LedgerTransactionOverview transfer={transfer} migrator={migrator}>
				<SidepanelFooter className="fixed right-0 bottom-0">
					<div className="flex items-center justify-end space-x-5">
						<Button variant="secondary" data-testid="LedgerScanStep__continue-button" onClick={onClose}>
							{t("COMMON.CLOSE")}
						</Button>

						<Button data-testid="LedgerScanStep__continue-button" onClick={onTryAgain}>
							{t("COMMON.TRY_AGAIN")}
						</Button>
					</div>
				</SidepanelFooter>
			</LedgerTransactionOverview>
		</div>
	);
};
