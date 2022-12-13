import React from "react";
import { Page } from "@/app/components/Layout";
import { useTranslation } from "react-i18next";

export const Migration = () => {
	const { t } = useTranslation();

	return (
		<>
			<Page pageTitle={t("MIGRATION.PAGE_MIGRATION.TITLE")} isBackDisabled={true} data-testid="Migration">
				<span>Migration Page</span>
			</Page>
		</>
	);
};
