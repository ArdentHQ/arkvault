import React from "react";
import { Button } from "@/app/components/Button";
import { useTranslation } from "react-i18next";
import { Image } from "@/app/components/Image";
import cn from "classnames";
import { Panel, usePanels } from "@/app/contexts/Panels";

export const Header = () => {
	const { t } = useTranslation();
	return (
		<>
			<h2 className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 font-semibold sm:text-2xl md:text-4xl">
				{t("DASHBOARD.WELCOME_TITLE")}
			</h2>
			<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200">
				{t("DASHBOARD.CREATE_OR_IMPORT_DESCRIPTION")}
			</p>
		</>
	);
};

export const HeaderMobile = () => {
	const { t } = useTranslation();
	return (
		<>
			<h4 className="text-theme-secondary-900 dark:text-theme-dark-50 text-lg font-semibold">
				{t("DASHBOARD.WELCOME_TO")}
			</h4>
			<h2 className="text-theme-secondary-900 dark:text-theme-dark-50 text-3xl leading-10">
				{t("COMMON.ARKVAULT")}
			</h2>
			<p className="text-theme-secondary-700 dark:text-theme-dark-200 text-sm">
				{t("DASHBOARD.CREATE_OR_IMPORT_DESCRIPTION")}
			</p>
		</>
	);
};

export const AddressActionsMenuMobile = () => {
	const { t } = useTranslation();

	const { openPanel } = usePanels();

	return (
		<>
			<div className="shadow-footer-smooth dark:shadow-footer-smooth-dark fixed bottom-0 left-0 z-10 flex w-full flex-col justify-center bg-white sm:hidden dark:bg-black">
				<div className="flex items-center justify-center space-x-3 px-6 py-3">
					<Button variant="secondary" className="w-full" onClick={() => openPanel(Panel.ImportAddress)}>
						{t("COMMON.IMPORT")}
					</Button>
					<Button variant="primary" className="w-full" onClick={() => openPanel(Panel.CreateAddress)}>
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
			"group border-theme-secondary-300 hover:border-theme-primary-50 hover:bg-theme-primary-50 dark:border-theme-dark-700 dark:bg-theme-dark-900 dark:hover:border-theme-dark-950 dark:hover:bg-theme-dark-950 dim:border-theme-dim-700 dim:bg-theme-dim-900 dim-hover:bg-theme-dim-950 cursor-pointer rounded border bg-white p-4 transition-all md:rounded-xl md:p-8",
		)}
		type="button"
		onClick={onClick}
	>
		<h3
			className={cn(
				"text-theme-secondary-900 group-hover:text-theme-primary-900 dark:text-theme-dark-50 dark:group-hover:text-theme-dark-50 dim:text-theme-dim-50 mb-2 text-left text-lg leading-4 font-semibold md:text-2xl md:leading-7.5",
			)}
		>
			{title}
		</h3>
		<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 mb-6 text-left text-sm leading-5">
			{description}
		</p>
		<div className="mx-auto my-6 flex max-w-56 justify-center md:max-w-full">
			<Image name={image} />
		</div>
		<div className="bg-theme-primary-100 text-theme-primary-600 dark:border-theme-dark-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200 dark:group-hover:border-theme-dark-navy-700 dark:group-hover:bg-theme-dark-navy-700 group-hover:bg-theme-primary-800 dim:bg-theme-dim-navy-900 dim:text-theme-dim-50 dim:group-hover:text-white dim:group-hover:bg-theme-dim-navy-700 dim:group-hover:border-theme-dim-navy-700 dim:border-theme-dim-navy-900 w-full rounded py-3 text-base leading-5 font-semibold transition-all duration-100 ease-linear group-hover:text-white dark:border">
			{buttonText}
		</div>
	</button>
);

export const DashboardSetupAddressCards = () => {
	const { t } = useTranslation();

	const { openPanel } = usePanels();

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
						onClick={() => openPanel(Panel.CreateAddress)}
					/>
					<DashboardSetupAddressCard
						image="ImportAddress"
						title={t("COMMON.IMPORT_ADDRESS")}
						description={t("DASHBOARD.WALLET_CONTROLS.IMPORT_ADDRESS_DESCRIPTION")}
						buttonText={t("COMMON.IMPORT")}
						onClick={() => openPanel(Panel.ImportAddress)}
					/>
				</div>
			</div>
		</>
	);
};
