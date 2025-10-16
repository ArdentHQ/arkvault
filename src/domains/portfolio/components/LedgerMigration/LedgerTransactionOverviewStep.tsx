import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { LedgerTransactionOverview } from "./LedgerTransactionOverview";
import { DraftTransfer } from "@/app/lib/mainsail/draft-transfer";

export const OverviewStep = ({
	transfer,
	onContinue,
	onVerifyAddress,
}: {
	transfer: DraftTransfer;
	onVerifyAddress?: () => void;
	onContinue?: () => void;
}) => {
	const { t } = useTranslation();
	const [acceptResponsibility, setAcceptResponsibility] = useState(false);

	return (
		<LedgerTransactionOverview transfer={transfer} onVerifyAddress={onVerifyAddress}>
			<SidepanelFooter className="fixed right-0 bottom-0">
				<div className="flex items-center space-x-5">
					<label className="flex w-full cursor-pointer space-x-3">
						<Checkbox
							name="VerifyResponsibility"
							onChange={(event) => setAcceptResponsibility(event.target.checked)}
						/>
						<span className="text-theme-secondary-700 dark:text-theme-secondary-500 text-sm">
							{t("COMMON.LEDGER_MIGRATION.ACCEPT_RESPONSIBILITY")}
						</span>
					</label>

					<Button
						data-testid="LedgerScanStep__continue-button"
						disabled={!acceptResponsibility}
						onClick={onContinue}
					>
						{t("COMMON.CONTINUE")}
					</Button>
				</div>
			</SidepanelFooter>
		</LedgerTransactionOverview>
	);
};
