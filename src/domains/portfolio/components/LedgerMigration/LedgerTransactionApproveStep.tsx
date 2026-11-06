import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { LedgerTransactionOverview } from "./LedgerTransactionOverview";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { Warning } from "@/app/components/AlertBanner";
import { SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { useLedgerRetryTimer } from "@/domains/portfolio/components/LedgerMigration/hooks/use-ledger-retry-timer";
import { Contracts } from "@/app/lib/profiles";

export const LedgerTransactionApproveStep = ({
	onSuccess,
	onError,
	transfer,
	migrator,
	profile,
}: {
	profile: Contracts.IProfile;
	transfer: DraftTransfer;
	onSuccess?: (transaction: ExtendedSignedTransactionData) => void;
	onError?: (error: string) => void;
	migrator: LedgerMigrator;
}) => {
	const { t } = useTranslation();

	const { shouldShowRetry, reset, isRetrying } = useLedgerRetryTimer({ profile });

	useEffect(() => {
		transfer.signAndBroadcast().then(onSuccess).catch(onError);
	}, [transfer]);

	const handleRetry = async () => {
		await reset();
		transfer.signAndBroadcast().then(onSuccess).catch(onError);
	};

	return (
		<div className="space-y-4 pb-10">
			{migrator.transactions().length === 1 && (
				<Warning>{t("COMMON.LEDGER_MIGRATION.APPROVE_LEDGER_TRANSACTION")}</Warning>
			)}

			<LedgerTransactionOverview transfer={transfer} migrator={migrator} showStatusBanner />

			{shouldShowRetry && (
				<SidepanelFooter className="fixed bottom-0 right-0">
					<div className="mb-2 flex items-center justify-between px-4">
						<span className="text-theme-secondary-500">Not showing on Ledger?</span>
						<Button onClick={handleRetry} isLoading={isRetrying} disabled={isRetrying}>
							{t("COMMON.RETRY")}
						</Button>
					</div>
				</SidepanelFooter>
			)}
		</div>
	);
};
