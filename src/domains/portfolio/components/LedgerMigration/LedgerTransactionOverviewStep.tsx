import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { LedgerTransactionOverview } from "./LedgerTransactionOverview";

export const OverviewStep = ({
	onContinue,
	network,
	senderWallet,
	recipients,
	profile,
	onVerifyAddress,
}: {
	onVerifyAddress?: () => void;
	profile: Contracts.IProfile;
	senderWallet: Contracts.IReadWriteWallet;
	network: Networks.Network;
	recipients: RecipientItem[];
	onContinue?: () => void;
}) => {
	const { t } = useTranslation();
	const [acceptResponsibility, setAcceptResponsibility] = useState(false);

	return (
		<LedgerTransactionOverview
			network={network}
			profile={profile}
			senderWallet={senderWallet}
			onVerifyAddress={onVerifyAddress}
			recipients={recipients}
		>
			<SidepanelFooter className="fixed right-0 bottom-0">
				<div className="flex items-center space-x-5">
					<label className="flex w-full cursor-pointer space-x-3">
						<Checkbox
							name="VerifyResponsibility"
							onChange={(event) => setAcceptResponsibility(event.target.checked)}
						/>
						<span className="text-theme-secondary-700 dark:text-theme-secondary-500 text-sm">
							{t("COMMON.LEDGER_MIGRATION.ACCEPT_RESPONSIBILITY")}
						</span>
					</label>

					<Button
						data-testid="LedgerScanStep__continue-button"
						disabled={!acceptResponsibility}
						onClick={onContinue}
					>
						{t("COMMON.CONTINUE")}
					</Button>
				</div>
			</SidepanelFooter>
		</LedgerTransactionOverview>
	);
};
