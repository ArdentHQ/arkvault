import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/app/components/Alert";
import { Checkbox } from "@/app/components/Checkbox";
import { Button } from "@/app/components/Button";
import { SidePanelButtons, SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Divider } from "@/app/components/Divider";
import { LedgerScanStep } from "./LedgerScanStep";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { LedgerData } from "@/app/contexts";
import { BigNumber } from "@/app/lib/helpers";

const MigrateToOneCheckbox = ({ onChange, isDisabled }: { isDisabled?: boolean, onChange?: (isChecked: boolean) => void }) => {
	const { t } = useTranslation();
	return (
		<label className="flex cursor-pointer space-x-3">
			<Checkbox name="MigrateToOne" onChange={(event) => onChange?.(event.target.checked)} disabled={isDisabled} />
			<div className="text-sm">
				<span className="text-sm font-semibold">{t("COMMON.LEDGER_MIGRATION.MIGRATE_TO_ONE_ADDRESS")}</span>
				<span className="text-theme-secondary-500 font-semibold"> {t("COMMON.OPTIONAL")}</span>

				<p className="text-theme-secondary-700 text-sm">
					{t("COMMON.LEDGER_MIGRATION.MIGRATE_TO_ONE_ADDRESS_DESCRIPTION")}
				</p>
			</div>
		</label>
	);
};

export const MigrationLedgerScanStep = ({
	migrator,
	onContinue,
	profile,
	network,
}: {
	migrator: LedgerMigrator;
	network: Networks.Network;
	profile: Contracts.IProfile;
	onContinue?: () => void;
}) => {
	const [shouldMigrateToOne, setShouldMigrateToOne] = useState<boolean>(false);
	const [isImportingWallets, setIsImportingWallets] = useState<boolean>(true);
	const [selectedLedgerAddresses, setSelectedLedgerAddresses] = useState<LedgerData[]>([]);
	const { t } = useTranslation();

	const handleSelectedAddresses = async (addresses: LedgerData[], migrateToOne: boolean) => {
		setIsImportingWallets(true);

		migrator.flushTransactions(); // Clear cache.

		if (addresses.length > 0) {
			await migrator.createTransactions(addresses, migrateToOne);
		}

		setIsImportingWallets(false);
	}

	return (
		<div className="pb-10">
			<LedgerScanStep
				disableColdWallets
				isLoading={isImportingWallets}
				profile={profile}
				network={network}
				onSelect={async (ledgerAddresses) => {
					const withBalance = ledgerAddresses.filter(address => BigNumber.make(address.balance ?? 0).isGreaterThan(0))
					setSelectedLedgerAddresses(withBalance)
					handleSelectedAddresses(withBalance, shouldMigrateToOne)
				}}
			>
				<>
					<div className="mt-4">
						<Alert collapsible title={t("COMMON.LEDGER_MIGRATION.HELP_TITLE")} variant="info">
							<p>{t("COMMON.LEDGER_MIGRATION.HELP.TITLE")}</p>
							<ol className="list-disc pl-5">
								<li>{t("COMMON.LEDGER_MIGRATION.HELP.GUIDELINE_1")}</li>
								<li>{t("COMMON.LEDGER_MIGRATION.HELP.GUIDELINE_2")}</li>
								<li>{t("COMMON.LEDGER_MIGRATION.HELP.GUIDELINE_3")}</li>
								<li>{t("COMMON.LEDGER_MIGRATION.HELP.GUIDELINE_4")}</li>
								<li>{t("COMMON.LEDGER_MIGRATION.HELP.GUIDELINE_5")}</li>
							</ol>
						</Alert>
					</div>

					<Divider
						dashed
						className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 my-6"
					/>

					<MigrateToOneCheckbox
						isDisabled={selectedLedgerAddresses.length === 0 || isImportingWallets}
						onChange={(migrateToOne) => {
							handleSelectedAddresses(selectedLedgerAddresses, migrateToOne)
							setShouldMigrateToOne(migrateToOne)
						}}
					/>

					<SidepanelFooter className="fixed right-0 bottom-0">
						<SidePanelButtons>
							<Button
								isLoading={isImportingWallets}
								data-testid="LedgerScanStep__continue-button"
								disabled={selectedLedgerAddresses.length === 0 || isImportingWallets}
								onClick={() => {
									onContinue?.();
								}}
							>
								{t("COMMON.CONTINUE")}
							</Button>
						</SidePanelButtons>
					</SidepanelFooter>
				</>
			</LedgerScanStep>
		</div>
	);
};
