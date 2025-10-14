import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { useActiveProfile } from "@/app/hooks";
import { SidePanelButtons, SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";


export const OverviewStep = ({
	onContinue
}: {
	onContinue?: () => void
}) => {
	const { t } = useTranslation();
	const profile = useActiveProfile();
	const [acceptResponsibility, setAcceptResponsibility] = useState(false)

	return (
		<div data-testid="LedgerMigration__Review-step">
			Review step

			<SidepanelFooter className="fixed right-0 bottom-0 ">
				<div className="flex items-center space-x-5">
					<label className="flex cursor-pointer space-x-3 w-full">
						<Checkbox name="VerifyResponsibility" onChange={(event) => setAcceptResponsibility(event.target.checked)} />
						<span className="text-sm text-theme-secondary-700 dark:text-theme-secondary-500">{t("COMMON.LEDGER_MIGRATION.ACCEPT_RESPONSIBILITY")}</span>
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
		</div>
	);
};
