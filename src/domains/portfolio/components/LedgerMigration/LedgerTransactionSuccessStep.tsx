import React from "react";
import { useTranslation } from "react-i18next";

import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { SidePanelButtons, SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Contracts } from "@/app/lib/profiles";
import { LedgerMigrationOverview } from "./LedgerMigrationOverview";

export const LedgerTransactionSuccessStep = ({
	profile,
	transfer,
	onGoToPortfolio,
}: {
	profile: Contracts.IProfile;
	transfer: DraftTransfer;
	onGoToPortfolio?: () => void;
}) => {
	const { t } = useTranslation();

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
