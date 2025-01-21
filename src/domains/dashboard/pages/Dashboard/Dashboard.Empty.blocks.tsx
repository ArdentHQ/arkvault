import React from "react";
import { Button } from "@/app/components/Button";
import { useWalletActions } from "@/domains/wallet/hooks";
import { useTranslation } from "react-i18next";
import { Image } from "@/app/components/Image";
import cn from "classnames";

export const Header = () => {
	const { t } = useTranslation();
	return (
		<>
			<h2 className="font-semibold text-theme-secondary-900 dark:text-theme-dark-50 sm:text-2xl md:text-4xl">
				{t("DASHBOARD.WELCOME_TITLE")}
			</h2>
			<p className="text-theme-secondary-700 dark:text-theme-dark-200">
				{t("DASHBOARD.CREATE_OR_IMPORT_DESCRIPTION")}
			</p>
		</>
	);
};

export const HeaderMobile = () => {
	const { t } = useTranslation();
	return (
		<>
			<h4 className="text-lg font-semibold text-theme-secondary-900 dark:text-theme-dark-50">
				{t("DASHBOARD.WELCOME_TO")}
			</h4>
			<h2 className="text-3xl leading-10 text-theme-secondary-900 dark:text-theme-dark-50">
				{t("COMMON.ARKVAULT")}
			</h2>
			<p className="text-sm text-theme-secondary-700 dark:text-theme-dark-200">
				{t("DASHBOARD.CREATE_OR_IMPORT_DESCRIPTION")}
			</p>
		</>
	);
};

export const AddressActionsMenuMobile = () => {
	const { t } = useTranslation();
	const { handleImport, handleCreate } = useWalletActions();

	return (
		<div className="fixed bottom-0 left-0 z-10 flex w-full flex-col justify-center bg-white shadow-footer-smooth dark:bg-black dark:shadow-footer-smooth-dark sm:hidden">
			<div className="flex items-center justify-center space-x-3 px-6 py-3">
				<Button variant="secondary" className="w-full" onClick={handleImport}>
					{t("COMMON.IMPORT")}
				</Button>
				<Button variant="primary" className="w-full" onClick={handleCreate}>
					{t("COMMON.CREATE")}
				</Button>
			</div>
		</div>
	);
};

export const DashboardSetupAddressCard = ({
	title,
	description,
	image,
	buttonText,
	onClick,
	variant = "primary",
}: {
	title: string;
	description: string;
	image: string;
	buttonText: string;
	onClick: () => void;
	variant?: "primary" | "secondary";
}) => (
	<div
		className={cn("rounded border border-theme-secondary-300 p-4 dark:border-theme-dark-700 md:rounded-xl md:p-8", {
			"bg-theme-primary-100 dark:bg-theme-dark-800": variant === "primary",
		})}
	>
		<h3
			className={cn("md:leading-7.5 mb-2 text-lg font-semibold leading-4 md:text-2xl", {
				"text-theme-primary-900 dark:text-theme-dark-50": variant === "primary",
				"text-theme-secondary-900 dark:text-theme-dark-50": variant === "secondary",
			})}
		>
			{title}
		</h3>
		<p className="mb-6 text-sm leading-5 text-theme-secondary-700 dark:text-theme-dark-200">{description}</p>
		<div className="mx-auto my-6 flex max-w-56 justify-center md:max-w-full">
			<Image name={image} />
		</div>
		<Button variant={variant} className="w-full" onClick={onClick}>
			{buttonText}
		</Button>
	</div>
);

export const DashboardSetupAddressCards = () => {
	const { t } = useTranslation();
	const { handleImport, handleCreate } = useWalletActions();

	return (
		<div className="flex-col">
			<div className="mb-6 space-y-1 px-8 md:mb-8">
				<Header />
			</div>

			<div className="flex items-center space-x-3">
				<DashboardSetupAddressCard
					image="ImportAddress"
					title={t("COMMON.IMPORT_ADDRESS")}
					description={t("DASHBOARD.WALLET_CONTROLS.IMPORT_ADDRESS_DESCRIPTION")}
					buttonText={t("COMMON.IMPORT")}
					onClick={handleImport}
					variant="secondary"
				/>

				<DashboardSetupAddressCard
					image="CreateAddress"
					title={t("COMMON.CREATE_ADDRESS")}
					description={t("DASHBOARD.WALLET_CONTROLS.CREATE_ADDRESS_DESCRIPTION")}
					buttonText={t("COMMON.CREATE")}
					onClick={handleCreate}
					variant="primary"
				/>
			</div>
		</div>
	);
};
