import React, { JSX, useEffect, useState } from "react";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useActiveProfile } from "@/app/hooks/env";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";

import { ListenLedger } from "@/domains/transaction/components/AuthenticationStep/Ledger/ListenLedger";
import { LedgerConnectionStep } from "./LedgerConnection";
import { LedgerScanStep } from "./LedgerScanStep";
import { MigrateLedgerStep } from "./LedgerMigration.contracts";
import { useLedgerMigrationHeader } from "./hooks/use-ledger-migration-header";

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

	// Reset step on close.
	useEffect(() => {
		if (!open) {
			setActiveTab(MigrateLedgerStep.ListenLedgerStep);
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
						<LedgerScanStep profile={profile} network={profile.activeNetwork()} onContinue={console.log} />
					</TabPanel>
				</div>
			</Tabs>
		</SidePanel>
	);
};
