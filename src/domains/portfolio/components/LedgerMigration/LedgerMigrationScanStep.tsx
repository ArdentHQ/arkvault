
import { Networks } from "@/app/lib/mainsail";
import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/app/components/Alert";
import { Checkbox } from "@/app/components/Checkbox";
import { LedgerData } from "@/app/contexts/Ledger";
import { Button } from "@/app/components/Button";
import { SidePanelButtons, SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Divider } from "@/app/components/Divider";
import { LedgerScanStep } from "./LedgerScanStep";


const MigrateToOneCheckbox = ({
	onChange
}: {
	onChange?: (isChecked: boolean) => void
}) => {
	const { t } = useTranslation()
	return (

		<label className="flex cursor-pointer space-x-3">
			<Checkbox name="MigrateToOne" onChange={(event) => onChange?.(event.target.checked)} />
			<div className="text-sm">
				<span className="text-sm font-semibold">
					{t("COMMON.LEDGER_MIGRATION.MIGRATE_TO_ONE_ADDRESS")}
				</span>
				<span className="text-theme-secondary-500 font-semibold"> {t("COMMON.OPTIONAL")}</span>

				<p className="text-sm text-theme-secondary-700">{t("COMMON.LEDGER_MIGRATION.MIGRATE_TO_ONE_ADDRESS_DESCRIPTION")}</p>
			</div>
		</label>
	)
}

export const MigrationLedgerScanStep = ({
	onContinue,
	profile,
	network,
}: {
	network: Networks.Network;
	profile: ProfilesContracts.IProfile;
	onContinue?: (selectedAddresses: LedgerData[], shouldMigrateToOne?: boolean) => void;
}) => {
	const [selectedAddresses, setSelectedAddresses] = useState<LedgerData[]>([])
	const [shouldMigrateToOne, setShouldMigrateToOne] = useState(false)
	const { t } = useTranslation();

	return (
		<LedgerScanStep
			profile={profile}
			network={network}
			onSelect={setSelectedAddresses}
		>
			<>
				<div className="mt-4">
					<Alert collapsible title={t("COMMON.LEDGER_MIGRATION.HELP_TITLE")} variant="info" >
						TBD
					</Alert>
				</div>

				<Divider dashed className="my-6 border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700" />

				<MigrateToOneCheckbox onChange={setShouldMigrateToOne} />

				<SidepanelFooter className="fixed right-0 bottom-0">
					<SidePanelButtons>
						<Button
							data-testid="LedgerScanStep__continue-button"
							disabled={selectedAddresses.length === 0}
							onClick={() => onContinue?.(selectedAddresses, shouldMigrateToOne)}
						>
							{t("COMMON.CONTINUE")}
						</Button>
					</SidePanelButtons>
				</SidepanelFooter>
			</>
		</LedgerScanStep>
	)

}
