import React from "react";
import { Page } from "@/app/components/Layout";
import { DashboardEmpty } from "@/domains/dashboard/pages/Dashboard/Dashboard.Empty";
import { useActiveProfile } from "@/app/hooks/env";
import { useTranslation } from "react-i18next";
import { Dashboard } from "@/domains/dashboard/pages/Dashboard/Dashboard";
import { Panel, usePanels } from "@/app/contexts/Panels";

export const Portfolio = () => {
	const profile = useActiveProfile();
	const { t } = useTranslation();

	const { currentOpenedPanel } = usePanels();

	return (
		<>
			{profile.wallets().selected().length > 0 && (
				<Dashboard
					hasFocus={currentOpenedPanel !== Panel.CreateAddress && currentOpenedPanel !== Panel.ImportAddress}
				/>
			)}

			{profile.wallets().selected().length === 0 && profile.status().isRestored() && (
				<Page pageTitle={t("COMMON.WELCOME")}>
					<DashboardEmpty />
				</Page>
			)}
		</>
	);
};
