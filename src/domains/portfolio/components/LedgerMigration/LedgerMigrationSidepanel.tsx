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
import { StopMigrationConfirmationModal } from "@/domains/portfolio/components/LedgerMigration/components/StopMigrationConfirmationModal";

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
	const [activeTab, setActiveTab] = useState(MigrateLedgerStep.ListenLedgerStep);
	const { title, subtitle, titleIcon } = useLedgerMigrationHeader(activeTab);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);

	const transfer = useRef(profile.draftTransactionFactory().transfer()).current;

	useEffect(() => {
		// TODO: Use migrating addresses
		const senderWallet = profile.wallets().first();
		transfer.setSender(senderWallet);
		transfer.addRecipient(senderWallet.address(), 1);
	}, []);

	// Reset step on close.
	useEffect(() => {
		if (!open) {
			setActiveTab(MigrateLedgerStep.ListenLedgerStep);
		}
	}, [open]);

	const handleOpenChange = (open: boolean) => {
		if (!open && activeTab === MigrateLedgerStep.ApproveTransactionStep) {
			setShowConfirmationModal(true);
			return;
		}

		onOpenChange(open);
	};

	return (
		<>
			<SidePanel
				title={title}
				minimizeable={false}
				open={open}
				onOpenChange={handleOpenChange}
				dataTestId="ImportAddressSidePanel"
				onMountChange={onMountChange}
				subtitle={subtitle}
				titleIcon={titleIcon}
				totalSteps={4}
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
								profile={profile}
								network={profile.activeNetwork()}
								onContinue={() => {
									setActiveTab(MigrateLedgerStep.OverviewStep);
								}}
							/>
						</TabPanel>

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
							<LedgerTransactionApproveStep transfer={transfer} />
						</TabPanel>
					</div>
				</Tabs>
			</SidePanel>
			<StopMigrationConfirmationModal
				isOpen={showConfirmationModal}
				onCancel={() => {
					setShowConfirmationModal(false);
				}}
				onConfirm={() => {
					setShowConfirmationModal(false);
					onOpenChange(false);
				}}
			/>
		</>
	);
};
