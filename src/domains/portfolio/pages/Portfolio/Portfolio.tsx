import React, { useState } from "react";
import { Page } from "@/app/components/Layout";
import { DashboardEmpty } from "@/domains/dashboard/pages/Dashboard/Dashboard.Empty";
import { useActiveProfile } from "@/app/hooks/env";
import { useTranslation } from "react-i18next";
import { Dashboard } from "@/domains/dashboard/pages/Dashboard/Dashboard";
import { usePortfolio } from "@/domains/portfolio/hooks/use-portfolio";
import { CreateAddressesSidePanel } from "@/domains/portfolio/components/CreateWallet/CreateAddressSidePanel";
import { ImportAddressesSidePanel } from "@/domains/portfolio/components/ImportWallet";
import { ForceUnmount } from "@/app/components/SidePanel/ForceUnmount";

export const Portfolio = () => {
	const profile = useActiveProfile();
	const { t } = useTranslation();

	const { selectedWallets } = usePortfolio({ profile });
	const [showCreateAddressPanel, setShowCreateAddressPanel] = useState(false);
	const [showImportAddressPanel, setShowImportAddressPanel] = useState(false);

	return (
		<>
			{selectedWallets.length > 0 && (
				<Dashboard
					hasFocus={!showCreateAddressPanel && !showImportAddressPanel}
					onImportAddress={setShowImportAddressPanel}
					onCreateAddress={setShowCreateAddressPanel}
				/>
			)}

			{selectedWallets.length === 0 && profile.status().isRestored() && (
				<Page pageTitle={t("COMMON.WELCOME")}>
					<DashboardEmpty
						onImportAddress={setShowImportAddressPanel}
						onCreateAddress={setShowCreateAddressPanel}
					/>
				</Page>
			)}

			<ForceUnmount>
				<CreateAddressesSidePanel open={showCreateAddressPanel} onOpenChange={setShowCreateAddressPanel} />
			</ForceUnmount>
			<ForceUnmount>
				<ImportAddressesSidePanel open={showImportAddressPanel} onOpenChange={setShowImportAddressPanel} />
			</ForceUnmount>
		</>
	);
};
