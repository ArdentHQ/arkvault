import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { SidePanelButtons, SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Contracts } from "@/app/lib/profiles";
import { LedgerMigrationOverview } from "./LedgerMigrationOverview";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { LedgerTransactionOverview } from "./LedgerTransactionOverview";
import { MigratedAddressesTable } from "./components/MigratedAddressesTable";

export const LedgerTransactionSuccessStep = ({
	profile,
	transfer,
	onGoToPortfolio,
	onGoToNextTransaction,
	migrator,
}: {
	migrator: LedgerMigrator;
	profile: Contracts.IProfile;
	transfer: DraftTransfer;
	onGoToPortfolio?: () => void;
	onGoToNextTransaction?: () => void;
}) => {
	const { t } = useTranslation();

	useEffect(() => {
		if (migrator.isMigrationComplete()) {
			return;
		}

		// Automatically navigate to the next transaction
		// if in the middle of a multiple migration.
		if (migrator.transactions().length > 1) {
			setTimeout(() => {
				onGoToNextTransaction?.();
			}, 2000);
		}
	}, [migrator]);

	if (migrator.isMigrationComplete() && migrator.transactions().length > 1) {
		return (
			<div className="space-y-4 pb-10">
				<MigratedAddressesTable transactions={migrator.transactions()} profile={profile} />
			</div>
		);
	}

	if (migrator.transactions().length > 1) {
		return (
			<div className="space-y-4 pb-10">
				<LedgerTransactionOverview transfer={transfer} migrator={migrator} showStatusBanner />
			</div>
		);
	}

	return (
		<div className="pb-10" data-testid="LedgerMigration_success">
			<LedgerMigrationOverview transfer={transfer} profile={profile}>
				<SidepanelFooter className="fixed right-0 bottom-0">
					<SidePanelButtons className="flex items-center justify-end">
						<Button data-testid="LedgerTransactionSuccessStep_goto-portfolio" onClick={onGoToPortfolio}>{t("COMMON.GO_TO_PORTFOLIO")}</Button>
					</SidePanelButtons>
				</SidepanelFooter>
			</LedgerMigrationOverview>
		</div>
	);
};
