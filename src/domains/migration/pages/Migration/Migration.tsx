import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, useHistory } from "react-router-dom";
import { ContractPausedAlert, MigrationHeader, MigrationNewMigrationMobileButton } from "./Migration.blocks";
import { MigrationTransaction } from "@/domains/migration/migration.contracts";
import { Page, Section } from "@/app/components/Layout";
import { MigrationDisclaimer } from "@/domains/migration/components/MigrationDisclaimer";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { MigrationTransactionsTable } from "@/domains/migration/components/MigrationTransactionsTable";
import { ProfilePaths } from "@/router/paths";
import { useMigrationTransactions } from "@/domains/migration/hooks/use-migration-transactions";
import { useMigrations } from "@/app/contexts";
import MigrationDetails from "@/domains/migration/pages/MigrationDetails";

export const Migration = () => {
	const { t } = useTranslation();
	const { isMd } = useBreakpoint();

	const [expandedTransaction, setExpandedTransaction] = useState<MigrationTransaction>();
	const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
	const history = useHistory();
	const profile = useActiveProfile();
	const { migrations, isLoading } = useMigrationTransactions({ profile });
	const { contractIsPaused } = useMigrations();

	const isCompact = useMemo(() => !profile.appearance().get("useExpandedTables") || isMd, [profile, isMd]);

	const onNewMigrationHandler = () => {
		setIsDisclaimerOpen(true);
	};

	const confirmHandler = useCallback(() => {
		const path = generatePath(ProfilePaths.MigrationAdd, { profileId: profile.id() });
		history.push(path);
	}, [history, profile]);

	const detailsHandler = useCallback((migrationTransaction: MigrationTransaction) => {
		setExpandedTransaction(migrationTransaction);
	}, []);

	if (expandedTransaction) {
		return (
			<MigrationDetails
				migrationTransaction={expandedTransaction}
				handleBack={() => setExpandedTransaction(undefined)}
			/>
		);
	}

	return (
		<>
			<Page pageTitle={t("MIGRATION.PAGE_MIGRATION.TITLE")} isBackDisabled={true} data-testid="Migration">
				<ContractPausedAlert />

				<MigrationHeader onNewMigration={onNewMigrationHandler} contractIsPaused={contractIsPaused} />

				<Section className="mt-4">
					<MigrationTransactionsTable
						migrationTransactions={migrations}
						isCompact={isCompact}
						isLoading={isLoading}
						onClick={(migrationTransaction) => detailsHandler(migrationTransaction)}
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
