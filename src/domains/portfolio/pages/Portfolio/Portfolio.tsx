import React from "react";
import { Page } from "@/app/components/Layout";
import { DashboardEmpty } from "@/domains/dashboard/pages/Dashboard/Dashboard.Empty";
import { useActiveProfile } from "@/app/hooks/env";
import { useTranslation } from "react-i18next";
import { Dashboard } from "@/domains/dashboard/pages/Dashboard/Dashboard";

export const Portfolio = () => {
	const activeProfile = useActiveProfile();
	const { t } = useTranslation();

	if (activeProfile.wallets().count() === 0) {
		if (activeProfile.status().isRestored()) {
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
