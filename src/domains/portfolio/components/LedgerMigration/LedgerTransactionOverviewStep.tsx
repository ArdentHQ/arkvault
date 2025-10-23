import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { LedgerTransactionOverview } from "./LedgerTransactionOverview";
import { DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { useLedgerContext } from "@/app/contexts";
import { Contracts } from "@/app/lib/profiles";

export const OverviewStep = ({
	profile,
	transfer,
	onContinue,
	onVerifyAddress,
	migrator,
}: {
	profile: Contracts.IProfile;
	transfer: DraftTransfer;
	onVerifyAddress?: () => void;
	onContinue?: () => void;
	migrator: LedgerMigrator;
}) => {
	const { t } = useTranslation();
	const [acceptResponsibility, setAcceptResponsibility] = useState(false);

	// Ensure ledger connection.
	const { connect, isConnected } = useLedgerContext();
	useEffect(() => {
		if (!isConnected) {
			connect(profile);
		}
	}, [profile, connect, isConnected]);

	return (
		<LedgerTransactionOverview
			transfer={transfer}
			onVerifyAddress={onVerifyAddress}
			migrator={migrator}
			showStatusBanner={false}
		>
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
