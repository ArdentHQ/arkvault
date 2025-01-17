import React from "react";
import { Button } from "@/app/components/Button";
import { useWalletActions } from "@/domains/wallet/hooks";
import { useTranslation } from "react-i18next";


const CreateOrImportWallet = () => {
	const { t } = useTranslation()
	const { handleImport, handleCreate } = useWalletActions();

	return (
		<div className="flex-col">
			<div className="mb-8 space-y-1 px-8">
				<h2 className="text-theme-secondary-900 dark:text-theme-dark-50">{t("DASHBOARD.WELCOME_TITLE")}</h2>
				<p className="text-theme-secondary-700 dark:text-theme-dark-200">{t("DASHBOARD.CREATE_OR_IMPORT_DESCRIPTION")}</p>
			</div>
			<div className="flex items-center space-x-3">
				<div className="rounded-xl border border-theme-secondary-300 dark:border-theme-dark-700 p-8">
					<h3 className="text-2xl font-semibold leading-7.5 text-theme-secondary-900 dark:text-theme-dark-50 mb-2">{t("COMMON.IMPORT_ADDRESS")}</h3>
					<p className="text-sm text-theme-secondary-700 dark:text-theme-dark-200 leading-5 mb-6">{t("DASHBOARD.WALLET_CONTROLS.IMPORT_ADDRESS_DESCRIPTION")}</p>
					<Button variant="secondary" className="w-full" onClick={handleImport}>{t("COMMON.IMPORT")}</Button>
				</div>
				<div className="rounded-xl border border-theme-secondary-300 dark:border-theme-dark-700 p-8 bg-theme-primary-100 dark:bg-theme-dark-800">
					<h3 className="text-2xl font-semibold leading-7.5 text-theme-primary-900 dark:text-theme-dark-50 mb-2">{t("COMMON.CREATE_ADDRESS")}</h3>
					<p className="text-sm text-theme-secondary-700 dark:text-theme-dark-200 leading-5 mb-6">{t("DASHBOARD.WALLET_CONTROLS.CREATE_ADDRESS_DESCRIPTION")}</p>
					<div />
					<Button variant="primary" className="w-full" onClick={handleCreate}>{t("COMMON.CREATE")}</Button>
				</div>
			</div>
		</div>
	)
}

export const DashboardEmpty = () => (
	<div className="flex items-center justify-center min-h-screen">
		<div className="max-w-[724px] min-h-screen">
			<CreateOrImportWallet />
		</div>
	</div>
);
