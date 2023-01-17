import React from "react";
import { useTranslation, Trans } from "react-i18next";
import {
	MigrationHeaderProperties,
	MigrationHeaderExtraProperties,
	MigrationNewMigrationMobileButtonProperties,
} from "./Migration.contracts";
import { Button } from "@/app/components/Button";
import { PageHeader } from "@/app/components/Header";
import { FormButtons } from "@/app/components/Form";
import { Alert } from "@/app/components/Alert";
import { Link } from "@/app/components/Link";
import { useMigrations } from "@/app/contexts";

const ContractPausedAlert = () => {
	const { contractIsPaused } = useMigrations();

	if (!contractIsPaused) {
		return <></>;
	}

	return (
		<Alert layout="horizontal">
			<Trans
				i18nKey="MIGRATION.CONTRACT_PAUSED_MESSAGE"
				components={{
					linkTwitter: <Link to="https://twitter.com/arkecosystem" isExternal />,
				}}
			/>
		</Alert>
	);
};

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

export { MigrationHeader, MigrationHeaderExtra, MigrationNewMigrationMobileButton, ContractPausedAlert };
