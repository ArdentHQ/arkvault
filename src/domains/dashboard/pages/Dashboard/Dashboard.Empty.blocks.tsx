import React from "react";
import { Button } from "@/app/components/Button";
import { useTranslation } from "react-i18next";
import { Image } from "@/app/components/Image";
import cn from "classnames";

export const Header = () => {
	const { t } = useTranslation();
	return (
		<>
			<h2 className="font-semibold sm:text-2xl md:text-4xl text-theme-secondary-900 dark:text-theme-dark-50">
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
			<div className="flex fixed bottom-0 left-0 z-10 flex-col justify-center w-full bg-white sm:hidden dark:bg-black shadow-footer-smooth dark:shadow-footer-smooth-dark">
				<div className="flex justify-center items-center py-3 px-6 space-x-3">
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
			"group border-theme-secondary-300 hover:border-theme-primary-50 hover:bg-theme-primary-50 dark:border-theme-dark-700 dark:bg-theme-dark-900 dark:hover:border-theme-dark-950 dark:hover:bg-theme-dark-950 rounded border bg-white p-4 transition-all md:rounded-xl md:p-8",
		)}
		type="button"
		onClick={onClick}
	>
		<h3
			className={cn(
				"text-theme-secondary-900 group-hover:text-theme-primary-900 dark:text-theme-dark-50 dark:group-hover:text-theme-dark-50 mb-2 text-left text-lg leading-4 font-semibold md:text-2xl md:leading-7.5",
			)}
		>
			{title}
		</h3>
		<p className="mb-6 text-sm leading-5 text-left text-theme-secondary-700 dark:text-theme-dark-200">
			{description}
		</p>
		<div className="flex justify-center my-6 mx-auto md:max-w-full max-w-56">
			<Image name={image} />
		</div>
		<div className="py-3 w-full text-base font-semibold leading-5 rounded transition-all duration-100 ease-linear dark:border group-hover:text-white bg-theme-primary-100 text-theme-primary-600 dark:border-theme-dark-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200 dark:group-hover:border-theme-dark-navy-700 dark:group-hover:bg-theme-dark-navy-700 group-hover:bg-theme-primary-800">
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
				<div className="px-8 mb-4 space-y-1 md:mb-8">
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
