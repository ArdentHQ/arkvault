import React, { JSX, useEffect, useState } from "react";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useActiveProfile } from "@/app/hooks/env";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";

import { ListenLedger } from "@/domains/transaction/components/AuthenticationStep/Ledger/ListenLedger";
import { LedgerConnectionStep } from "./LedgerConnection";
import { LedgerScanStep } from "./LedgerScanStep";

export enum MigrateLedger {
	ListenLedgerStep = 1,
	ConnectionStep,
	ScanStep,
}

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
	const [activeTab, setActiveTab] = useState(MigrateLedger.ListenLedgerStep)

	// Reset step on close.
	useEffect(() => {
		if (!open) {
			setActiveTab(MigrateLedger.ListenLedgerStep)
		}
	}, [open])

	return (
		<SidePanel
			title="test"
			minimizeable={false}
			open={open}
			onOpenChange={onOpenChange}
			dataTestId="ImportAddressSidePanel"
			onMountChange={onMountChange}
		>
			<Tabs activeId={activeTab}>
				<div>
					<TabPanel tabId={MigrateLedger.ListenLedgerStep}>
						<ListenLedger
							noHeading
							onDeviceAvailable={() => {
								console.log("onDeviceAvailable")
								setActiveTab(MigrateLedger.ConnectionStep)
							}}
							onDeviceNotAvailable={() => {
								console.log("not available")
							}}
						/>
					</TabPanel>

					<TabPanel tabId={MigrateLedger.ConnectionStep}>
						<LedgerConnectionStep
							isCancelling={false}
							profile={profile}
							onConnect={() => {
								setActiveTab(MigrateLedger.ScanStep)
							}}
							onFailed={() => {
								setActiveTab(MigrateLedger.ListenLedgerStep)
							}}
							network={profile.activeNetwork()}
						/>
					</TabPanel>

					<TabPanel tabId={MigrateLedger.ScanStep}>
						<LedgerScanStep
							cancelling={false}
							profile={profile}
							network={profile.activeNetwork()}
							onFinish={console.log}
						/>
					</TabPanel>
				</div>
			</Tabs>
		</SidePanel>
	);
};
