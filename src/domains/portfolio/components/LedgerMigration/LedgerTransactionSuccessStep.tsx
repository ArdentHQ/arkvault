import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { SidePanelButtons, SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Contracts } from "@/app/lib/profiles";
import { LedgerMigrationOverview } from "./LedgerMigrationOverview";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { LedgerTransactionOverview } from "./LedgerTransactionOverview";

export const LedgerTransactionSuccessStep = ({
	profile,
	transfer,
	onGoToPortfolio,
	onGoToNextTransaction,
	migrator,
}: {
	migrator: LedgerMigrator,
	profile: Contracts.IProfile;
	transfer: DraftTransfer;
	onGoToPortfolio?: () => void;
	onGoToNextTransaction?: () => void;
}) => {
	const { t } = useTranslation();

	useEffect(() => {
		if (migrator.isCompleted()) {
			return
		}

		if (migrator.transactions().length > 1) {
			setTimeout(() => {
				onGoToNextTransaction?.()
			}, 3000)
		}
	}, [migrator])


	if (migrator.isCompleted()) {
		return (
			<div className="space-y-4">
				<div>Completed</div>
			</div>
		)
	}


	if (migrator.transactions().length > 1) {
		return (
			<div className="space-y-4">
				<LedgerTransactionOverview transfer={transfer} migrator={migrator} showStatusBanner />
			</div>
		);
	}

	return (
		<LedgerMigrationOverview transfer={transfer} profile={profile}>
			<SidepanelFooter className="fixed right-0 bottom-0">
				<SidePanelButtons className="flex items-center justify-end">
					<Button onClick={onGoToPortfolio}>{t("COMMON.GO_TO_PORTFOLIO")}</Button>
				</SidePanelButtons>
			</SidepanelFooter>
		</LedgerMigrationOverview>
	);
};
