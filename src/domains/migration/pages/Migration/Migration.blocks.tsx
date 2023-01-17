import React from "react";
import { useTranslation } from "react-i18next";
import {
	MigrationHeaderProperties,
	MigrationHeaderExtraProperties,
	MigrationNewMigrationMobileButtonProperties,
} from "./Migration.contracts";
import { Button } from "@/app/components/Button";
import { PageHeader } from "@/app/components/Header";
import { FormButtons } from "@/app/components/Form";

const MigrationHeader: React.FC<MigrationHeaderProperties> = ({ onNewMigration, contractIsPaused }) => {
	const { t } = useTranslation();

	return (
		<PageHeader
			title={t("MIGRATION.PAGE_MIGRATION.TITLE")}
			subtitle={t("MIGRATION.PAGE_MIGRATION.SUBTITLE")}
			extra={<MigrationHeaderExtra onNewMigration={onNewMigration} contractIsPaused={contractIsPaused} />}
			border
		/>
	);
};

const MigrationHeaderExtra: React.FC<MigrationHeaderExtraProperties> = ({ onNewMigration, contractIsPaused }) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="hidden py-4 sm:block sm:h-auto md:py-0">
				<Button
					className="ml-6"
					sizeClassName="px-5 md:py-3 py-2"
					data-testid="Migrations__add-migration-btn"
					onClick={onNewMigration}
					disabled={contractIsPaused}
				>
					{t("MIGRATION.PAGE_MIGRATION.NEW_MIGRATION")}
				</Button>
			</div>
		</>
	);
};

const MigrationNewMigrationMobileButton: React.FC<MigrationNewMigrationMobileButtonProperties> = ({
	onNewMigration,
	contractIsPaused,
}) => {
	const { t } = useTranslation();

	return (
		<div className="sm:hidden">
			<FormButtons>
				<Button
					variant="primary"
					data-testid="Migrations__add-migration-btn-mobile"
					onClick={onNewMigration}
					disabled={contractIsPaused}
				>
					{t("MIGRATION.PAGE_MIGRATION.NEW_MIGRATION")}
				</Button>
			</FormButtons>
		</div>
	);
};

export { MigrationHeader, MigrationHeaderExtra, MigrationNewMigrationMobileButton };
