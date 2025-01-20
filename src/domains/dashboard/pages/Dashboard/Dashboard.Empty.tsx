import React from "react";
import { Button } from "@/app/components/Button";
import { useWalletActions } from "@/domains/wallet/hooks";
import { useTranslation } from "react-i18next";
import { Image } from "@/app/components/Image";

const CreateOrImportWallet = () => {
	const { t } = useTranslation();
	const { handleImport, handleCreate } = useWalletActions();

	return (
		<div className="flex-col">
			<div className="mb-8 space-y-1 px-8">
				<h2 className="text-theme-secondary-900 dark:text-theme-dark-50 md:text-4xl sm:text-2xl">{t("DASHBOARD.WELCOME_TITLE")}</h2>
				<p className="text-theme-secondary-700 dark:text-theme-dark-200">
					{t("DASHBOARD.CREATE_OR_IMPORT_DESCRIPTION")}
				</p>
			</div>
			<div className="flex items-center space-x-3">
				<div className="rounded md:rounded-xl border border-theme-secondary-300 p-4 md:p-8 dark:border-theme-dark-700">
					<h3 className="md:leading-7.5 mb-2 md:text-2xl font-semibold text-theme-secondary-900 dark:text-theme-dark-50 text-lg leading-4">
						{t("COMMON.IMPORT_ADDRESS")}
					</h3>
					<p className="mb-6 text-sm leading-5 text-theme-secondary-700 dark:text-theme-dark-200">
						{t("DASHBOARD.WALLET_CONTROLS.IMPORT_ADDRESS_DESCRIPTION")}
					</p>
					<div className="my-6 flex justify-center max-w-56 md:max-w-full mx-auto">
						<Image name="ImportAddress" />
					</div>
					<Button variant="secondary" className="w-full " onClick={handleImport}>
						{t("COMMON.IMPORT")}
					</Button>
				</div>
				<div className="rounded md:rounded-xl border border-theme-secondary-300 bg-theme-primary-100 p-4 md:p-8 dark:border-theme-dark-700 dark:bg-theme-dark-800">
					<h3 className="md:leading-7.5 mb-2 md:text-2xl font-semibold text-theme-secondary-900 dark:text-theme-dark-50 text-lg leading-4">
						{t("COMMON.CREATE_ADDRESS")}
					</h3>
					<p className="mb-6 text-sm leading-5 text-theme-secondary-700 dark:text-theme-dark-200">
						{t("DASHBOARD.WALLET_CONTROLS.CREATE_ADDRESS_DESCRIPTION")}
					</p>
					<div className="my-6 flex justify-center max-w-56 md:max-w-full mx-auto">
						<Image name="CreateAddress" />
					</div>
					<Button variant="primary" className="w-full" onClick={handleCreate}>
						{t("COMMON.CREATE")}
					</Button>
				</div>
			</div>
		</div>
	);
};

export const DashboardEmpty = () => (
	<div className="flex items-center justify-center">
		<div className="flex h-page max-w-[45.25rem] md:items-center mt-6 sm:mt-14 md:mt-0 px-4 md:px-0">
			<CreateOrImportWallet />
		</div>
	</div>
);
