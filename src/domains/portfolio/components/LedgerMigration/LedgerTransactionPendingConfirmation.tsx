import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Divider } from "@/app/components/Divider";
import { Spinner } from "@/app/components/Spinner";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";
import { SidePanelButtons, SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { LedgerMigrationOverview } from "./LedgerMigrationOverview";
import { Contracts } from "@/app/lib/profiles";
import { Warning } from "@/app/components/AlertBanner";

export const LedgerTransactionPendingConfirmation = ({
	transfer,
	onConfirmed,
	onGoToPortfolio,
	profile,
}: {
	profile: Contracts.IProfile;
	transfer: DraftTransfer;
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
			onConfirmed?.();
		}
	}, [isConfirmed]);

	return (
		<div className="space-y-4">
			<Warning>
				{t("TRANSACTION.PENDING.STATUS_TEXT")}
			</Warning>

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
