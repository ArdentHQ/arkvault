import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { LedgerTransactionOverview } from "./LedgerTransactionOverview";
import { Divider } from "@/app/components/Divider";
import { Spinner } from "@/app/components/Spinner";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";

export const LedgerTransactionApproveStep = ({
	onSuccess,
	onError,
	transfer,
}: {
	transfer: DraftTransfer;
	onSuccess?: (transaction: ExtendedSignedTransactionData) => void;
	onError?: (error: string) => void;
}) => {
	const { t } = useTranslation();

	useEffect(() => {
		transfer.signAndBroadcast().then(onSuccess).catch(onError);
	}, [transfer]);

	return (
		<div className="space-y-4">
			<div className="border-theme-warning-200 bg-theme-warning-50 dark:border-theme-warning-600 dim:border-theme-warning-600 dim:bg-theme-dim-900 flex items-center space-x-3 rounded-xl border px-3 py-2 max-sm:text-sm sm:px-6 sm:py-4 sm:leading-5 dark:bg-transparent">
				<Spinner color="warning-alt" size="sm" width={3} />
				<Divider
					type="vertical"
					className="text-theme-warning-200 dark:text-theme-secondary-800 dim:text-theme-dim-700 h-5"
				/>
				<p className="text-theme-secondary-700 dark:text-theme-warning-600 dim:text-theme-dim-200 font-semibold">
					{t("COMMON.LEDGER_MIGRATION.APPROVE_LEDGER_TRANSACTION")}
				</p>
			</div>

			<LedgerTransactionOverview transfer={transfer} />
		</div>
	);
};
