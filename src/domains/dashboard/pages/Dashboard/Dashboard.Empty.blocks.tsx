import React from "react";
import { Button } from "@/app/components/Button";
import { useWalletActions } from "@/domains/wallet/hooks";
import { useTranslation } from "react-i18next";
import { Image } from "@/app/components/Image";
import { DashboardSetupAddressSlider } from "./Dashboard.Empty.Slider";
import cn from "classnames";

export const Header = () => {
	const { t } = useTranslation();
	return (
		<>
			<h2 className="text-theme-secondary-900 dark:text-theme-dark-50 md:text-4xl sm:text-2xl">{t("DASHBOARD.WELCOME_TITLE")}</h2>
			<p className="text-theme-secondary-700 dark:text-theme-dark-200">
				{t("DASHBOARD.CREATE_OR_IMPORT_DESCRIPTION")}
			</p>
		</>
	)
}

export const HeaderMobile = () => {
	const { t } = useTranslation();
	return (
		<>
			<h4 className="text-theme-secondary-900 dark:text-theme-dark-50 text-lg font-semibold">{t("DASHBOARD.WELCOME_TO")}</h4>
			<h2 className="text-theme-secondary-900 dark:text-theme-dark-50 text-3xl leading-10">{t("COMMON.ARKVAULT")}</h2>
			<p className="text-theme-secondary-700 dark:text-theme-dark-200">
				{t("DASHBOARD.CREATE_OR_IMPORT_DESCRIPTION")}
			</p>
		</>
	)
}

export const AddressActionsMenuMobile = () => {
	const { t } = useTranslation();
	const { handleImport, handleCreate } = useWalletActions();

	return (
		<div className="fixed bottom-0 left-0 z-10 flex w-full flex-col justify-center bg-white dark:bg-black sm:hidden shadow-footer-smooth dark:shadow-footer-smooth-dark">
			<div className="flex items-center justify-center space-x-3 py-3 px-6">
				<Button variant="secondary" className="w-full " onClick={handleImport}>
					{t("COMMON.IMPORT")}
				</Button>
				<Button variant="primary" className="w-full" onClick={handleCreate}>
					{t("COMMON.CREATE")}
				</Button>
			</div>
		</div>
	)
}

export const DashboardSetupAddressCard = ({
	title,
	description,
	image,
	buttonText,
	onClick,
	variant = "primary"
}: {
	title: string,
	description: string,
	image: string,
	buttonText: string
	onClick: () => void
	variant?: "primary" | "secondary"
}) => (
	<div className={cn("rounded md:rounded-xl border border-theme-secondary-300 p-4 md:p-8 dark:border-theme-dark-700", {
		"bg-theme-primary-100 dark:bg-theme-dark-800": variant === "primary"
	})}>
		<h3 className={cn("md:leading-7.5 mb-2 md:text-2xl font-semibold text-lg leading-4", {
			"text-theme-primary-900 dark:text-theme-dark-50": variant === "primary",
			"text-theme-secondary-900 dark:text-theme-dark-50": variant === "secondary"
		})}>
			{title}
		</h3>
		<p className="mb-6 text-sm leading-5 text-theme-secondary-700 dark:text-theme-dark-200">
			{description}
		</p>
		<div className="my-6 flex justify-center max-w-56 md:max-w-full mx-auto">
			<Image name={image} />
		</div>
		<Button variant={variant} className="w-full " onClick={onClick}>
			{buttonText}
		</Button>
	</div>
);

export const DashboardSetupAddressCards = () => {
	const { t } = useTranslation();
	const { handleImport, handleCreate } = useWalletActions();

	return (
		<div className="flex-col">
			<div className="mb-8 space-y-1 px-8">
				<Header />
			</div>

			<div className="flex items-center space-x-3">
				<DashboardSetupAddressCard
					image="ImportAddress"
					title={t("COMMON.IMPORT_ADDRESS")}
					description={t("DASHBOARD.WALLET_CONTROLS.IMPORT_ADDRESS_DESCRIPTION")}
					buttonText={t("COMMON.IMPORT")}
					onClick={handleImport}
					variant="secondary" />

				<DashboardSetupAddressCard
					image="CreateAddress"
					title={t("COMMON.CREATE_ADDRESS")}
					description={t("DASHBOARD.WALLET_CONTROLS.CREATE_ADDRESS_DESCRIPTION")}
					buttonText={t("COMMON.CREATE")}
					onClick={handleCreate}
					variant="primary" />
			</div>
		</div>
	);
};
