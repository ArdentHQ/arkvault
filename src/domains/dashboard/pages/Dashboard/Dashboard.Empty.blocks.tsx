import React from "react";
import { Button } from "@/app/components/Button";
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

export const AddressActionsMenuMobile = ({
	onCreateAddress,
	onImportAddress,
}: {
	onCreateAddress?: (open: boolean) => void;
	onImportAddress?: (open: boolean) => void;
}) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="fixed bottom-0 left-0 z-10 flex w-full flex-col justify-center bg-white shadow-footer-smooth dark:bg-black dark:shadow-footer-smooth-dark sm:hidden">
				<div className="flex items-center justify-center space-x-3 px-6 py-3">
					<Button variant="secondary" className="w-full" onClick={() => onImportAddress?.(true)}>
						{t("COMMON.IMPORT")}
					</Button>
					<Button variant="primary" className="w-full" onClick={() => onCreateAddress?.(true)}>
						{t("COMMON.CREATE")}
					</Button>
				</div>
			</div>
		</>
	);
};

export const DashboardSetupAddressCard = ({
	title,
	description,
	image,
	buttonText,
	onClick,
}: {
	title: string;
	description: string;
	image: string;
	buttonText: string;
	onClick: () => void;
}) => (
	<button
		className={cn(
			"group rounded-xs border border-theme-secondary-300 bg-white p-4 transition-all hover:border-theme-primary-50 hover:bg-theme-primary-50 dark:border-theme-dark-700 dark:bg-theme-dark-900 dark:hover:border-theme-dark-950 dark:hover:bg-theme-dark-950 md:rounded-xl md:p-8",
		)}
		type="button"
		onClick={onClick}
	>
		<h3
			className={cn(
				"md:leading-7.5 mb-2 text-left text-lg font-semibold leading-4 text-theme-secondary-900 group-hover:text-theme-primary-900 dark:text-theme-dark-50 dark:group-hover:text-theme-dark-50 md:text-2xl",
			)}
		>
			{title}
		</h3>
		<p className="mb-6 text-left text-sm leading-5 text-theme-secondary-700 dark:text-theme-dark-200">
			{description}
		</p>
		<div className="mx-auto my-6 flex max-w-56 justify-center md:max-w-full">
			<Image name={image} />
		</div>
		<div className="w-full rounded-xs bg-theme-primary-100 py-3 text-base font-semibold leading-5 text-theme-primary-600 transition-all duration-100 ease-linear group-hover:bg-theme-primary-800 group-hover:text-white dark:border dark:border-theme-dark-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200 dark:group-hover:border-theme-dark-navy-700 dark:group-hover:bg-theme-dark-navy-700">
			{buttonText}
		</div>
	</button>
);

export const DashboardSetupAddressCards = ({
	onCreateAddress,
	onImportAddress,
}: {
	onCreateAddress?: (open: boolean) => void;
	onImportAddress?: (open: boolean) => void;
}) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="flex-col">
				<div className="mb-4 space-y-1 px-8 md:mb-8">
					<Header />
				</div>

				<div className="flex items-center space-x-3">
					<DashboardSetupAddressCard
						image="CreateAddress"
						title={t("COMMON.CREATE_ADDRESS")}
						description={t("DASHBOARD.WALLET_CONTROLS.CREATE_ADDRESS_DESCRIPTION")}
						buttonText={t("COMMON.CREATE")}
						onClick={() => onCreateAddress?.(true)}
					/>
					<DashboardSetupAddressCard
						image="ImportAddress"
						title={t("COMMON.IMPORT_ADDRESS")}
						description={t("DASHBOARD.WALLET_CONTROLS.IMPORT_ADDRESS_DESCRIPTION")}
						buttonText={t("COMMON.IMPORT")}
						onClick={() => onImportAddress?.(true)}
					/>
				</div>
			</div>
		</>
	);
};
