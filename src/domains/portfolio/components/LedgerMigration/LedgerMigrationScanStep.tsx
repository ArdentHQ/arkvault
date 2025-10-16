import { Networks } from "@/app/lib/mainsail";
import { Contracts, Contracts as ProfilesContracts } from "@/app/lib/profiles";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/app/components/Alert";
import { Checkbox } from "@/app/components/Checkbox";
import { LedgerData } from "@/app/contexts/Ledger";
import { Button } from "@/app/components/Button";
import { SidePanelButtons, SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Divider } from "@/app/components/Divider";
import { LedgerScanStep } from "./LedgerScanStep";
import { getLedgerDefaultAlias } from "@/domains/wallet/utils/get-default-alias";
import { WalletLedgerModel } from "@/app/lib/profiles/wallet.enum";

const MigrateToOneCheckbox = ({ onChange }: { onChange?: (isChecked: boolean) => void }) => {
	const { t } = useTranslation();
	return (
		<label className="flex cursor-pointer space-x-3">
			<Checkbox name="MigrateToOne" onChange={(event) => onChange?.(event.target.checked)} />
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
	onContinue,
	profile,
	network,
}: {
	network: Networks.Network;
	profile: ProfilesContracts.IProfile;
	onContinue?: (wallets: Contracts.IReadWriteWallet[], shouldMigrateToOne?: boolean) => void;
}) => {
	const [selectedAddresses, setSelectedAddresses] = useState<LedgerData[]>([]);
	const [shouldMigrateToOne, setShouldMigrateToOne] = useState<boolean>(false);
	const [isImportingWallets, setIsImportingWallets] = useState<boolean>(false);
	const { t } = useTranslation();

	return (
		<LedgerScanStep profile={profile} network={network} onSelect={setSelectedAddresses}>
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

				<MigrateToOneCheckbox onChange={setShouldMigrateToOne} />

				<SidepanelFooter className="fixed right-0 bottom-0">
					<SidePanelButtons>
						<Button
							isLoading={isImportingWallets}
							data-testid="LedgerScanStep__continue-button"
							disabled={selectedAddresses.length === 0 || isImportingWallets}
							onClick={async () => {
								setIsImportingWallets(true);

								const wallets: Contracts.IReadWriteWallet[] = [];
								for (const ledgerAddress of selectedAddresses) {
									const wallet = await profile.walletFactory().fromAddressWithDerivationPath({
										address: ledgerAddress.address,
										path: ledgerAddress.path,
									});

									const alias = getLedgerDefaultAlias({
										network: wallet.network(),
										path: ledgerAddress.path,
										profile,
									});
									// TODO: fix model.
									wallet.data().set(Contracts.WalletData.LedgerModel, WalletLedgerModel.NanoSP);
									wallet.mutator().alias(alias);
									wallets.push(wallet);
								}

								setIsImportingWallets(false);
								onContinue?.(wallets, shouldMigrateToOne);
							}}
						>
							{t("COMMON.CONTINUE")}
						</Button>
					</SidePanelButtons>
				</SidepanelFooter>
			</>
		</LedgerScanStep>
	);
};
