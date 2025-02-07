import React from "react";
import { Page } from "@/app/components/Layout";
import { DashboardEmpty } from "@/domains/dashboard/pages/Dashboard/Dashboard.Empty";
import { useActiveProfile } from "@/app/hooks/env";
import { useTranslation } from "react-i18next";
import { Dashboard } from "@/domains/dashboard/pages/Dashboard/Dashboard";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { usePortfolio } from "@/domains/portfolio/hooks/use-portfolio";

export const Portfolio = () => {
	const profile = useActiveProfile();
	const { t } = useTranslation();

	const { activeNetwork } = useActiveNetwork({ profile });
	const { selectedWallets } = usePortfolio({ profile })

	if (!activeNetwork || selectedWallets.length === 0) {
		if (profile.status().isRestored()) {
			return (
				<Page pageTitle={t("COMMON.WELCOME")}>
					<DashboardEmpty />
				</Page>
			);
		}

		return <div />;
	}

	return <Dashboard />;
};
