import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { LedgerTransactionOverview } from "./LedgerTransactionOverview";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { Warning } from "@/app/components/AlertBanner";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";

export const LedgerTransactionApproveStep = ({
	onSuccess,
	onError,
	transfer,
	migrator,
}: {
	transfer: DraftTransfer;
	onSuccess?: (transaction: ExtendedSignedTransactionData) => void;
	onError?: (error: string) => void;
	migrator: LedgerMigrator;
}) => {
	const { t } = useTranslation();

	useEffect(() => {
		transfer.signAndBroadcast().then(onSuccess).catch(onError);
	}, [transfer]);

	return (
		<div className="space-y-4">
			{migrator.transactions().length === 1 && (
				<Warning>{t("COMMON.LEDGER_MIGRATION.APPROVE_LEDGER_TRANSACTION")}</Warning>
			)}

			<LedgerTransactionOverview transfer={transfer} migrator={migrator} showStatusBanner />
		</div>
	);
};
