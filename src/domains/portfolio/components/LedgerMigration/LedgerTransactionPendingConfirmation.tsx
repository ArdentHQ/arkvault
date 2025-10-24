import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";
import { SidePanelButtons, SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { LedgerMigrationOverview } from "./LedgerMigrationOverview";
import { Contracts } from "@/app/lib/profiles";
import { Warning } from "@/app/components/AlertBanner";
import { LedgerMigrator, MigrationTransaction } from "@/app/lib/mainsail/ledger.migrator";
import { LedgerTransactionOverview } from "./LedgerTransactionOverview";

export const LedgerTransactionPendingConfirmation = ({
	migrator,
	transfer,
	onConfirmed,
	onGoToPortfolio,
	profile,
}: {
	migrator: LedgerMigrator;
	profile: Contracts.IProfile;
	transfer: MigrationTransaction;
	onConfirmed?: () => void;
	onGoToPortfolio?: () => void;
}) => {
	const { t } = useTranslation();

	const { isConfirmed } = useConfirmedTransaction({
		transactionId: transfer.signedTransaction()?.hash(),
		wallet: transfer.sender(),
	});

	useEffect(() => {
		if (isConfirmed) {
			transfer.setIsPending(false);
			transfer.setIsCompleted(true);
			onConfirmed?.();
		}
	}, [isConfirmed, transfer]);

	if (migrator.transactions().length > 1) {
		return (
			<div className="space-y-4 pb-10">
				<LedgerTransactionOverview transfer={transfer} migrator={migrator} showStatusBanner />
			</div>
		);
	}

	return (
		<div className="space-y-4 pb-10">
			{migrator.transactions().length === 1} {<Warning>{t("TRANSACTION.PENDING.STATUS_TEXT")}</Warning>}
			<LedgerMigrationOverview transfer={transfer} profile={profile}>
				<SidepanelFooter className="fixed right-0 bottom-0">
					<SidePanelButtons className="flex items-center justify-end">
						<Button onClick={onGoToPortfolio}>{t("COMMON.GO_TO_PORTFOLIO")}</Button>
					</SidePanelButtons>
				</SidepanelFooter>
			</LedgerMigrationOverview>
		</div>
	);
};
