import React, { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, matchPath, useHistory, useLocation } from "react-router-dom";
import { MigrationDetails } from "@/domains/migration/components/MigrationDetails";
import { Page } from "@/app/components/Layout";
import { useMigrationTransactions } from "@/domains/migration/hooks/use-migration-transactions";
import { useActiveProfile } from "@/app/hooks";
import { Migration as MigrationTransaction } from "@/domains/migration/migration.contracts";
import { ProfilePaths } from "@/router/paths";

export const MigrationOverview = () => {
	const { t } = useTranslation();
	const profile = useActiveProfile();
	const { pathname } = useLocation();

	const urlMatch = matchPath(pathname, { path: "/profiles/:profileId/migrations/:migrationId" });
	const migrationId = (urlMatch?.params as any)?.migrationId;

	const [expandedMigration, setExpandedMigration] = useState<MigrationTransaction>();
	const history = useHistory();

	const { migrations, getMigrationById } = useMigrationTransactions({
		profile,
	});

	useLayoutEffect(() => {
		const migrationTransaction = getMigrationById(migrationId);

		if (!migrationTransaction) {
			history.push(
				generatePath(ProfilePaths.Migration, {
					profileId: profile.id(),
				}),
			);
			return;
		}

		setExpandedMigration(migrationTransaction);
	}, [migrations, migrationId]);

	if (!expandedMigration) {
		return <></>;
	}

	return (
		<Page pageTitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}>
			<MigrationDetails
				migrationTransaction={expandedMigration}
				handleBack={() => {
					history.push(
						generatePath(ProfilePaths.Migration, {
							profileId: profile.id(),
						}),
					);
				}}
			/>
		</Page>
	);
};
