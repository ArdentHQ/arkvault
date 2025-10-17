import React, { JSX, useEffect, useRef, useState } from "react";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useActiveProfile } from "@/app/hooks/env";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";

import { ListenLedger } from "@/domains/transaction/components/AuthenticationStep/Ledger/ListenLedger";
import { LedgerConnectionStep } from "./LedgerConnection";
import { MigrateLedgerStep } from "./LedgerMigration.contracts";
import { useLedgerMigrationHeader } from "./hooks/use-ledger-migration-header";
import { MigrationLedgerScanStep } from "./LedgerMigrationScanStep";
import { OverviewStep } from "./LedgerTransactionOverviewStep";
import { LedgerTransactionApproveStep } from "./LedgerTransactionApproveStep";
import { LedgerTransactionErrorStep } from "./LedgerTransactionErrorStep";
import { LedgerTransactionPendingConfirmation } from "./LedgerTransactionPendingConfirmation";
import { useEnvironmentContext } from "@/app/contexts";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { LedgerTransactionSuccessStep } from "./LedgerTransactionSuccessStep";

export const LedgerMigrationSidepanel = ({
	open,
	onOpenChange,
	onMountChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onMountChange?: (mounted: boolean) => void;
}): JSX.Element => {
	const profile = useActiveProfile();
	const { env } = useEnvironmentContext();
	const [activeTab, setActiveTab] = useState(MigrateLedgerStep.ListenLedgerStep);
	const { title, subtitle, titleIcon } = useLedgerMigrationHeader(activeTab);

	const migrator = useRef(new LedgerMigrator({ env, profile })).current;
	const transfer = migrator.firstTransaction();

	useEffect(() => {
		// Reset state on close.
		if (!open) {
			migrator.reset();
			setActiveTab(MigrateLedgerStep.ListenLedgerStep);
			return;
		}
	}, [open]);

	return (
		<SidePanel
			title={title}
			minimizeable={false}
			open={open}
			onOpenChange={onOpenChange}
			dataTestId="ImportAddressSidePanel"
			onMountChange={onMountChange}
			subtitle={subtitle}
			titleIcon={titleIcon}
			totalSteps={8}
			hasSteps
			activeStep={activeTab}
		>
			<Tabs activeId={activeTab}>
				<div>
					<TabPanel tabId={MigrateLedgerStep.ListenLedgerStep}>
						<ListenLedger
							noHeading
							onDeviceAvailable={() => {
								setActiveTab(MigrateLedgerStep.ConnectionStep);
							}}
							onDeviceNotAvailable={() => {
								console.log("not available");
							}}
						/>
					</TabPanel>

					<TabPanel tabId={MigrateLedgerStep.ConnectionStep}>
						<LedgerConnectionStep
							profile={profile}
							onConnect={() => {
								setActiveTab(MigrateLedgerStep.ScanStep);
							}}
							onFailed={() => {
								setActiveTab(MigrateLedgerStep.ListenLedgerStep);
							}}
							network={profile.activeNetwork()}
						/>
					</TabPanel>

					<TabPanel tabId={MigrateLedgerStep.ScanStep}>
						<MigrationLedgerScanStep
							migrator={migrator}
							profile={profile}
							network={profile.activeNetwork()}
							onContinue={() => {
								setActiveTab(MigrateLedgerStep.OverviewStep);
							}}
						/>
					</TabPanel>

					{transfer && (
						<>
							<TabPanel tabId={MigrateLedgerStep.OverviewStep}>
								<OverviewStep
									transfer={transfer}
									onContinue={() => {
										setActiveTab(MigrateLedgerStep.ApproveTransactionStep);
									}}
									onVerifyAddress={() => console.log("TODO: Implement verify address flow")}
								/>
							</TabPanel>

							<TabPanel tabId={MigrateLedgerStep.ApproveTransactionStep}>
								<LedgerTransactionApproveStep
									transfer={transfer}
									onSuccess={() => {
										setActiveTab(MigrateLedgerStep.PendingConfirmationStep);
									}}
									onError={() => {
										setActiveTab(MigrateLedgerStep.ErrorStep);
									}}
								/>
							</TabPanel>

							<TabPanel tabId={MigrateLedgerStep.PendingConfirmationStep}>
								<LedgerTransactionPendingConfirmation
									profile={profile}
									transfer={transfer}
									onGoToPortfolio={() => {
										onOpenChange(false);
										setActiveTab(MigrateLedgerStep.ListenLedgerStep);
									}}
									onConfirmed={() => {
										setActiveTab(MigrateLedgerStep.SuccessStep);
									}}
								/>
							</TabPanel>

							<TabPanel tabId={MigrateLedgerStep.SuccessStep}>
								<LedgerTransactionSuccessStep
									profile={profile}
									transfer={transfer}
									onGoToPortfolio={() => {
										onOpenChange(false);
										setActiveTab(MigrateLedgerStep.ListenLedgerStep);
									}}
								/>
							</TabPanel>

							<TabPanel tabId={MigrateLedgerStep.ErrorStep}>
								<LedgerTransactionErrorStep
									transfer={transfer}
									onClose={() => {
										onOpenChange(false);
										setActiveTab(MigrateLedgerStep.ListenLedgerStep);
									}}
									onTryAgain={() => {
										setActiveTab(MigrateLedgerStep.ApproveTransactionStep);
									}}
								/>
							</TabPanel>
						</>
					)}
				</div>
			</Tabs>
		</SidePanel>
	);
};
