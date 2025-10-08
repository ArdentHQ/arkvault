import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { useTranslation } from "react-i18next";

export const LedgerMigrationAlert = ({
	onCancel,
	onStart,
}: {
	onStart?: () => void
	onCancel?: () => void
}) => {
	const { t } = useTranslation();
	return (
		<div className="dark:bg-theme-dark-800 dark:text-theme-dark-200 dim:bg-theme-dim-800 dim:text-theme-dim-200 text-theme-secondary-900 bg-theme-warning-50 rounded-t-lg p-4 md:py-2">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between">
				<span className="text-sm">{t("COMMON.LEDGER_MIGRATION.UPDATE_TO_ETH_DERIVATION_PATH")}</span>
				<div className="mt-3 flex items-center md:mt-0">
					<Button
						variant="secondary-icon"
						className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent w-auto space-x-2 px-2 py-[3px]"
						onClick={onCancel}
					>
						<span>{t("COMMON.CANCEL")}</span>
					</Button>
					<Divider
						type="vertical"
						className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 mx-3 h-5 p-0"
					/>
					<Button
						variant="secondary-icon"
						className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent w-auto px-2 py-[3px] whitespace-nowrap"
						onClick={onStart}
					>
						<span>{t("COMMON.LEDGER_MIGRATION.START_MIGRATION")}</span>
					</Button>
				</div>
			</div>
		</div>
	);
};
