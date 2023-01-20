import React from "react";
import { useTranslation } from "react-i18next";
import { Page, Section } from "@/app/components/Layout";

export const MigrationDetails = () => {
	const { t } = useTranslation();

	return (
		<Page pageTitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}>
			<Section className="flex-1">
				<p>lomre</p>
			</Section>
		</Page>
	);
};
