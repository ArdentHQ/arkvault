import React from "react";
import { useTranslation } from "react-i18next";

import { LedgerTransactionOverview } from "./LedgerTransactionOverview";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { SidePanelButtons, SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";

export const LedgerTransactionSuccessStep = ({
	transfer,
	onGoToPortfolio,
}: {
	transfer: DraftTransfer;
	onGoToPortfolio?: () => void
}) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<LedgerTransactionOverview transfer={transfer} >
				<SidepanelFooter className="fixed right-0 bottom-0">
					<SidePanelButtons className="flex items-center justify-end">
						<Button onClick={onGoToPortfolio}>
							{t("COMMON.GO_TO_PORTFOLIO")}
						</Button>
					</SidePanelButtons>
				</SidepanelFooter>
			</LedgerTransactionOverview>
		</div>
	);
};
