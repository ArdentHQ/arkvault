import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MigrationHeader, MigrationNewMigrationMobileButton } from "./Migration.blocks";
import { Page, Section } from "@/app/components/Layout";
import { MigrationDisclaimer } from "@/domains/migration/components/MigrationDisclaimer";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import {
	MigrationTransactionsTable,
	MigrationTransactionStatus,
} from "@/domains/migration/components/MigrationTransactionsTable";
import { generatePath, useHistory } from "react-router-dom";
import { ProfilePaths } from "@/router/paths";

export const Migration = () => {
	const { t } = useTranslation();
	const { isMd } = useBreakpoint();

	const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
	const history = useHistory();
	const profile = useActiveProfile();

	// @TBD
	const migrations = [
		{
			id: "id",
			timestamp: Date.now() / 1000,
			amount: 123,
			address: "AXzxJ8Ts3dQ2bvBR1tPE7GUee9iSEJb8HX",
			migrationAddress: "0x0000000000000000000000000000000000000000",
			status: MigrationTransactionStatus.Confirmed,
		},
		{
			timestamp: Date.now() / 1000,
			amount: 123,
			address: "AXzxJ8Ts3dQ2bvBR1tPE7GUee9iSEJb8HX",
			migrationAddress: "0x0000000000000000000000000000000000000000",
			status: MigrationTransactionStatus.Waiting,
		},
	];

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
				<MigrationHeader onNewMigration={onNewMigrationHandler} />

				<Section className="mt-4">
					<MigrationTransactionsTable
						migrationTransactions={migrations}
						isCompact={isCompact}
						onClick={() => console.log("row click")}
					/>
				</Section>

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
