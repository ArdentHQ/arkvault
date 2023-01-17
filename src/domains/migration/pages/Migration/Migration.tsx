import React, { useCallback, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { generatePath, useHistory } from "react-router-dom";
import { MigrationHeader, MigrationNewMigrationMobileButton } from "./Migration.blocks";
import { Page, Section } from "@/app/components/Layout";
import { MigrationDisclaimer } from "@/domains/migration/components/MigrationDisclaimer";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { MigrationTransactionsTable } from "@/domains/migration/components/MigrationTransactionsTable";
import { ProfilePaths } from "@/router/paths";
import { useMigrations } from "@/app/contexts";
import { Alert } from "@/app/components/Alert";
import { Link } from "@/app/components/Link";

export const Migration = () => {
	const { t } = useTranslation();
	const { isMd } = useBreakpoint();

	const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
	const history = useHistory();
	const profile = useActiveProfile();
	const { migrations, contractIsPaused } = useMigrations();

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
				{contractIsPaused && (
					<>
						<Alert layout="horizontal">
							<Trans
								i18nKey="MIGRATION.CONTRACT_PAUSED_MESSAGE"
								components={{
									linkTwitter: <Link to="https://twitter.com/arkecosystem" isExternal />,
								}}
							/>
						</Alert>
					</>
				)}

				<MigrationHeader onNewMigration={onNewMigrationHandler} contractIsPaused={contractIsPaused} />

				<Section className="mt-4">
					<MigrationTransactionsTable
						migrationTransactions={migrations}
						isCompact={isCompact}
						isLoading={migrations === undefined}
						onClick={() => console.log("row click")}
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
