import { Button } from "@/app/components/Button"
import { Divider } from "@/app/components/Divider"
import { useTranslation } from "react-i18next"

export const LedgerMigrationAlert = () => {
	const { t } = useTranslation()
	return (
		<div className="md:py-2 p-4 dark:bg-theme-dark-800 dark:text-theme-dark-200 dim:bg-theme-dim-800 dim:text-theme-dim-200 text-theme-secondary-900 bg-theme-warning-50 rounded-t-lg">
			<div className="flex md:items-center md:justify-between md:flex-row flex-col">
				<span className="text-sm">{t("COMMON.LEDGER_MIGRATION.UPDATE_TO_ETH_DERIVATION_PATH")}</span>
				<div className="flex items-center mt-3 md:mt-0">
					<Button
						variant="secondary-icon"
						className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent w-auto space-x-2 px-2 py-[3px]"
						onClick={console.log}>
						<span>{t("COMMON.CANCEL")}</span>
					</Button>
					<Divider
						type="vertical"
						className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 h-5 p-0 mx-3"
					/>
					<Button
						variant="secondary-icon"
						className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent w-auto whitespace-nowrap py-[3px] px-2"
						onClick={console.log}>
						<span>{t("COMMON.LEDGER_MIGRATION.START_MIGRATION")}</span>
					</Button>
				</div>
			</div>
		</div>
	)
}
