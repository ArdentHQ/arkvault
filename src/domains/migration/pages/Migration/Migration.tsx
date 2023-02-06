import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, useHistory } from "react-router-dom";
import { ContractPausedAlert, MigrationHeader, MigrationNewMigrationMobileButton } from "./Migration.blocks";
import { Page, Section } from "@/app/components/Layout";
import { MigrationDisclaimer } from "@/domains/migration/components/MigrationDisclaimer";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { MigrationTransactionsTable } from "@/domains/migration/components/MigrationTransactionsTable";
import { ProfilePaths } from "@/router/paths";
import { useMigrations } from "@/app/contexts";
import { toasts } from "@/app/services";
export const Migration = () => {
	const { t } = useTranslation();
	const { isMd } = useBreakpoint();
	const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
	const [errorMessageShown, setErrorMessageShown] = useState(false);
	const history = useHistory();
	const profile = useActiveProfile();

	const {
		contractIsPaused,
		isLoading,
		onLoadMore,
		hasMore,
		isLoadingMore,
		loadMigrationsError,
		paginatedMigrations,
	} = useMigrations();

	useEffect(() => {
		if (loadMigrationsError) {
			if (!errorMessageShown) {
				toasts.error(t("MIGRATION.PAGE_MIGRATION.ERRORS.FETCHING_MIGRATIONS_FAILED"));
				setErrorMessageShown(true);
			}
		} else {
			setErrorMessageShown(false);
		}
	}, [loadMigrationsError, errorMessageShown]);

	const isCompact = useMemo(() => !profile.appearance().get("useExpandedTables") || isMd, [profile, isMd]);

	const onNewMigrationHandler = () => {
		setIsDisclaimerOpen(true);
	};

	const confirmHandler = useCallback(() => {
		const path = generatePath(ProfilePaths.MigrationAdd, { profileId: profile.id() });
		history.push(path);
	}, [history, profile]);

	return (
		<>
			<Page pageTitle={t("MIGRATION.PAGE_MIGRATION.TITLE")} isBackDisabled={true} data-testid="Migration">
				<ContractPausedAlert />

				<MigrationHeader onNewMigration={onNewMigrationHandler} contractIsPaused={contractIsPaused} />

				<Section className="mt-4">
					<MigrationTransactionsTable
						migrationTransactions={paginatedMigrations}
						isCompact={isCompact}
						isLoading={isLoading}
						isLoadingMore={isLoadingMore}
						onClick={(migrationTransaction) => {
							history.push(
								generatePath(ProfilePaths.MigrationOverview, {
									migrationId: migrationTransaction.id,
									profileId: profile.id(),
								}),
							);
						}}
						onLoadMore={onLoadMore}
						hasMore={hasMore}
					/>
				</Section>

				<MigrationNewMigrationMobileButton
					onNewMigration={onNewMigrationHandler}
					contractIsPaused={contractIsPaused}
				/>

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
