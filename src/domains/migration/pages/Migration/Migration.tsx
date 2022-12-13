import React from "react";
import { useTranslation } from "react-i18next";
import { MigrationEmpty, MigrationHeader, MigrationNewMigrationMobileButton } from "./Migration.blocks";
import { Page } from "@/app/components/Layout";

const newMigrationHandler = () => {
	console.log("@TODO: newMigrationHandler");
};

export const Migration = () => {
	const { t } = useTranslation();

	return (
		<>
			<Page pageTitle={t("MIGRATION.PAGE_MIGRATION.TITLE")} isBackDisabled={true} data-testid="Migration">
				<MigrationHeader onNewMigration={newMigrationHandler} />

				<MigrationNewMigrationMobileButton onNewMigration={newMigrationHandler} />

				<MigrationEmpty />
			</Page>
		</>
	);
};
