import React from "react";
import { useTranslation } from "react-i18next";
import { MigrationEmpty, MigrationHeader, MigrationNewMigrationMobileButton } from "./Migration.blocks";
import { Page } from "@/app/components/Layout";

const newMigrationHandler = () => {
	// @TODO: newMigrationHandler
};

export const Migration = () => {
	const { t } = useTranslation();

	const migrations = [];

	const renderMigrations = () => {
		/* istanbul ignore else -- @preserve */
		if (migrations.length === 0) {
			return <MigrationEmpty />;
		}
	};

	return (
		<>
			<Page pageTitle={t("MIGRATION.PAGE_MIGRATION.TITLE")} isBackDisabled={true} data-testid="Migration">
				<MigrationHeader onNewMigration={newMigrationHandler} />

				{renderMigrations()}

				<MigrationNewMigrationMobileButton onNewMigration={newMigrationHandler} />
			</Page>
		</>
	);
};
