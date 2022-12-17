import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MigrationHeader, MigrationNewMigrationMobileButton } from "./Migration.blocks";
import { Page, Section } from "@/app/components/Layout";
import { MigrationDisclaimer } from "@/domains/migration/components/MigrationDisclaimer";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { MigrationTransactionsTable } from "@/domains/migration/components/MigrationTransactionsTable";

const confirmHandler = () => {
	// @TODO: Start migration
};

// @TBD
const migrations = [1];

export const Migration = () => {
	const { t } = useTranslation();
	const { isMd } = useBreakpoint();

	const activeProfile = useActiveProfile();

	const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

	const isCompact = useMemo(
		() => !activeProfile.appearance().get("useExpandedTables") || isMd,
		[activeProfile, isMd],
	);

	const onNewMigrationHandler = () => {
		setIsDisclaimerOpen(true);
	};

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
