import React, { useState } from "react";
import { Page } from "@/app/components/Layout";
import { DashboardEmpty } from "@/domains/dashboard/pages/Dashboard/Dashboard.Empty";
import { useActiveProfile } from "@/app/hooks/env";
import { useTranslation } from "react-i18next";
import { Dashboard } from "@/domains/dashboard/pages/Dashboard/Dashboard";
import { CreateAddressesSidePanel } from "@/domains/portfolio/components/CreateWallet/CreateAddressSidePanel";
import { ImportAddressesSidePanel } from "@/domains/portfolio/components/ImportWallet";
import { ResetWhenUnmounted } from "@/app/components/SidePanel/ResetWhenUnmounted";
import { DEFAULT_TRANSITION_DELAY_MS } from "@/app/components/SidePanel/SidePanel";

export const Portfolio = () => {
	const profile = useActiveProfile();
	const { t } = useTranslation();

	const [showCreateAddressPanel, setShowCreateAddressPanel] = useState(false);
	const [showImportAddressPanel, setShowImportAddressPanel] = useState(false);

	return (
		<>
			{profile.wallets().selected().length > 0 && (
				<Dashboard
					hasFocus={!showCreateAddressPanel && !showImportAddressPanel}
					onImportAddress={setShowImportAddressPanel}
					onCreateAddress={setShowCreateAddressPanel}
				/>
			)}

			{profile.wallets().selected().length === 0 && profile.status().isRestored() && (
				<Page pageTitle={t("COMMON.WELCOME")}>
					<DashboardEmpty
						onImportAddress={setShowImportAddressPanel}
						onCreateAddress={setShowCreateAddressPanel}
					/>
				</Page>
			)}

			<ResetWhenUnmounted>
				<CreateAddressesSidePanel
					open={showCreateAddressPanel}
					onOpenChange={setShowCreateAddressPanel}
					onImportAddress={() => {
						setShowCreateAddressPanel(false)
						setTimeout(() => {
							setShowImportAddressPanel(true)
						}, DEFAULT_TRANSITION_DELAY_MS)
					}}
				/>
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<ImportAddressesSidePanel open={showImportAddressPanel} onOpenChange={setShowImportAddressPanel} />
			</ResetWhenUnmounted>
		</>
	);
};
