import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { LedgerTransactionOverview } from "./LedgerTransactionOverview";
import { Divider } from "@/app/components/Divider";
import { Spinner } from "@/app/components/Spinner";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";
import { SidePanelButtons, SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";

export const LedgerTransactionPendingConfirmation = ({
	transfer,
	onConfirmed,
	onGoToPortfolio,
}: {
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
			<div className="border-theme-warning-200 bg-theme-warning-50 dark:border-theme-warning-600 dim:border-theme-warning-600 dim:bg-theme-dim-900 flex items-center space-x-3 rounded-xl border px-3 py-2 max-sm:text-sm sm:px-6 sm:py-4 sm:leading-5 dark:bg-transparent">
				<Spinner color="warning-alt" size="sm" width={3} />
				<Divider
					type="vertical"
					className="text-theme-warning-200 dark:text-theme-secondary-800 dim:text-theme-dim-700 h-5"
				/>
				<p className="text-theme-secondary-700 dark:text-theme-warning-600 dim:text-theme-dim-200 font-semibold">
					{t("TRANSACTION.PENDING.STATUS_TEXT")}
				</p>
			</div>

			<LedgerTransactionOverview transfer={transfer}>
				<SidepanelFooter className="fixed right-0 bottom-0">
					<SidePanelButtons className="flex items-center justify-end">
						<Button onClick={onGoToPortfolio}>{t("COMMON.GO_TO_PORTFOLIO")}</Button>
					</SidePanelButtons>
				</SidepanelFooter>
			</LedgerTransactionOverview>
		</div>
	);
};
