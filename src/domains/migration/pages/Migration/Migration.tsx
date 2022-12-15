import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { generatePath } from "react-router";
import { MigrationEmpty, MigrationHeader, MigrationNewMigrationMobileButton } from "./Migration.blocks";
import { Page } from "@/app/components/Layout";
import { MigrationDisclaimer } from "@/domains/migration/components/MigrationDisclaimer";
import { ProfilePaths } from "@/router/paths";
import { useActiveProfile } from "@/app/hooks";

export const Migration = () => {
	const { t } = useTranslation();
	const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
	const history = useHistory();
	const profile = useActiveProfile();
	const migrations = [];

	const onNewMigrationHandler = () => {
		setIsDisclaimerOpen(true);
	};

	const renderMigrations = () => {
		/* istanbul ignore else -- @preserve */
		if (migrations.length === 0) {
			return <MigrationEmpty />;
		}
	};

	const confirmHandler = useCallback(() => {
		const path = generatePath(ProfilePaths.MigrationAdd, { profileId: profile.id() });
		history.push(path);
	}, [history, profile]);

	return (
		<>
			<Page pageTitle={t("MIGRATION.PAGE_MIGRATION.TITLE")} isBackDisabled={true} data-testid="Migration">
				<MigrationHeader onNewMigration={onNewMigrationHandler} />

				{renderMigrations()}

				<MigrationNewMigrationMobileButton onNewMigration={onNewMigrationHandler} />

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
