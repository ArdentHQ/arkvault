import React from "react";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { MigrateLedgerStep } from "@/domains/portfolio/components/LedgerMigration";
import { useTranslation } from "react-i18next";

export const useLedgerMigrationHeader = ({
	activeTab,
	hasMultipleTransactions,
}: {
	activeTab: MigrateLedgerStep;
	hasMultipleTransactions: boolean;
}) => {
	const { t } = useTranslation();

	switch (activeTab) {
		case MigrateLedgerStep.SuccessStep: {
			return {
				subtitle: hasMultipleTransactions
					? t("COMMON.LEDGER_MIGRATION.SUCCESS_DESCRIPTION_MULTIPLE")
					: t("COMMON.LEDGER_MIGRATION.SUCCESS_DESCRIPTION"),
				title: t("COMMON.LEDGER_MIGRATION.MIGRATION_COMPLETED"),
				titleIcon: (
					<ThemeIcon
						lightIcon="CheckmarkDoubleCircle"
						darkIcon="CheckmarkDoubleCircle"
						dimIcon="CheckmarkDoubleCircle"
						dimensions={[24, 24]}
						className="text-theme-success-600"
					/>
				),
			};
		}

		case MigrateLedgerStep.PendingConfirmationStep: {
			return {
				subtitle: hasMultipleTransactions ? t("COMMON.LEDGER_MIGRATION.VERIFY_DETAILS_ON_LEDGER") : undefined,
				title: t("TRANSACTION.PENDING.TITLE"),
				titleIcon: (
					<ThemeIcon
						lightIcon="UnconfirmedTransaction"
						darkIcon="UnconfirmedTransaction"
						dimIcon="UnconfirmedTransaction"
						dimensions={[24, 24]}
						className="text-theme-primary-600"
					/>
				),
			};
		}

		case MigrateLedgerStep.ApproveTransactionStep: {
			return {
				subtitle: t("COMMON.LEDGER_MIGRATION.VERIFY_DETAILS_ON_LEDGER"),
				title: t("COMMON.LEDGER_MIGRATION.APPROVE_TRANSACTION_TITLE"),
				titleIcon: (
					<ThemeIcon
						lightIcon="LedgerLight"
						darkIcon="LedgerDark"
						dimIcon="LedgerDim"
						dimensions={[24, 24]}
					/>
				),
			};
		}

		case MigrateLedgerStep.OverviewStep: {
			return {
				subtitle: t("COMMON.LEDGER_MIGRATION.OVERVIEW_SUBTITLE"),
				title: t("TRANSACTION.REVIEW_STEP.TITLE"),
				titleIcon: (
					<ThemeIcon
						lightIcon="LedgerLight"
						darkIcon="LedgerDark"
						dimIcon="LedgerDim"
						dimensions={[24, 24]}
					/>
				),
			};
		}

		case MigrateLedgerStep.ConnectionStep:
		case MigrateLedgerStep.ListenLedgerStep: {
			return {
				subtitle: undefined,
				title: t("COMMON.LEDGER_MIGRATION.ADDRESS_MIGRATION"),
				titleIcon: <Icon name="CheckedDocument" dimensions={[24, 24]} />,
			};
		}

		case MigrateLedgerStep.ErrorStep: {
			return {
				title: t("COMMON.LEDGER_MIGRATION.LEDGER_MIGRATION_FAILED_TITLE"),
				titleIcon: (
					<Icon
						name="CircleCross"
						dimensions={[24, 24]}
						className="text-theme-danger-700 dark:text-theme-danger-info-border dim:text-theme-danger-400"
					/>
				),
			};
		}

		default: {
			return {
				subtitle: t("COMMON.LEDGER_MIGRATION.SELECT_MIGRATION_ADDRESSES"),
				title: t("COMMON.LEDGER_MIGRATION.ADDRESS_MIGRATION"),
				titleIcon: <Icon name="CheckedDocument" dimensions={[24, 24]} />,
			};
		}
	}
};
