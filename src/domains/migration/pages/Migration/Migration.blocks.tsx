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
import { Section } from "@/app/components/Layout";
import { EmptyBlock } from "@/app/components/EmptyBlock";

const MigrationHeader: React.FC<MigrationHeaderProperties> = ({ onNewMigration }) => {
	const { t } = useTranslation();

	return (
		<PageHeader
			title={t("MIGRATION.PAGE_MIGRATION.TITLE")}
			subtitle={t("MIGRATION.PAGE_MIGRATION.SUBTITLE")}
			extra={<MigrationHeaderExtra onNewMigration={onNewMigration} />}
			border
		/>
	);
};

const MigrationHeaderExtra: React.FC<MigrationHeaderExtraProperties> = ({ onNewMigration }) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="hidden py-4 md:py-0 sm:block sm:h-auto">
				<Button
					className="ml-6"
					sizeClassName="px-5 md:py-3 py-2"
					data-testid="Migrations__add-migration-btn"
					onClick={onNewMigration}
				>
					{t("MIGRATION.PAGE_MIGRATION.NEW_MIGRATION")}
				</Button>
			</div>
		</>
	);
};

const MigrationNewMigrationMobileButton: React.FC<MigrationNewMigrationMobileButtonProperties> = ({ onNewMigration }) => {
	const { t } = useTranslation();

	return (
		<div className="sm:hidden">
			<FormButtons>
				<Button variant="primary" data-testid="Migrations__add-migration-btn-mobile" onClick={onNewMigration}>
					{t("MIGRATION.PAGE_MIGRATION.NEW_MIGRATION")}
				</Button>
			</FormButtons>
		</div>
	);
};

const MigrationEmpty = () => {
	const { t } = useTranslation();

	return (
		<Section className="mt-4">
			<EmptyBlock data-testid="Migrations--empty-results">
				{t("MIGRATION.PAGE_MIGRATION.NO_MIGRATIONS")}
			</EmptyBlock>
		</Section>
	);
};

export { MigrationHeader, MigrationHeaderExtra, MigrationNewMigrationMobileButton, MigrationEmpty };
