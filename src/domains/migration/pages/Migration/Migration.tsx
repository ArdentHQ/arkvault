import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MigrationEmpty, MigrationHeader, MigrationNewMigrationMobileButton } from "./Migration.blocks";
import { Page } from "@/app/components/Layout";
import { MigrationDisclaimer } from "@/domains/migration/components/MigrationDisclaimer";
const confirmHandler = () => {
	// @TODO: Start migration
};

export const Migration = () => {
	const { t } = useTranslation();

	const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

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
				<MigrationHeader onNewMigration={() => setIsDisclaimerOpen(true)} />

				{renderMigrations()}

				<MigrationNewMigrationMobileButton onNewMigration={() => setIsDisclaimerOpen(true)} />

				<MigrationDisclaimer
					isOpen={isDisclaimerOpen}
					onClose={() => setIsDisclaimerOpen(false)}
					onCancel={() => setIsDisclaimerOpen(false)}
					onConfirm={confirmHandler}
				/>
			</Page>
		</>
	);
};
