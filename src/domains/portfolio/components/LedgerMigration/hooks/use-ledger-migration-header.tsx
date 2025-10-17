import React, { useMemo } from "react";
import { Icon } from "@/app/components/Icon";
import { MigrateLedgerStep } from "@/domains/portfolio/components/LedgerMigration";
import { useTranslation } from "react-i18next";

export const useLedgerMigrationHeader = (activeTab: MigrateLedgerStep) => {
	const { t } = useTranslation();

	return useMemo(() => {
		if ([MigrateLedgerStep.ListenLedgerStep, MigrateLedgerStep.ConnectionStep].includes(activeTab)) {
			return {
				subtitle: undefined,
				title: t("COMMON.LEDGER_MIGRATION.ADDRESS_MIGRATION"),
				titleIcon: <Icon name="CheckedDocument" dimensions={[24, 24]} />,
			};
		}

		return {
			subtitle: t("COMMON.LEDGER_MIGRATION.SELECT_MIGRATION_ADDRESSES"),
			title: t("COMMON.LEDGER_MIGRATION.ADDRESS_MIGRATION"),
			titleIcon: <Icon name="CheckedDocument" dimensions={[24, 24]} />,
		};
	}, [activeTab]);
};
