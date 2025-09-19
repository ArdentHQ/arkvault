import { Networks } from "@/app/lib/mainsail";
import React from "react";
import { Contracts } from "@/app/lib/profiles";

import { ImportOption } from "@/domains/wallet/hooks/use-import-options";
import cn from "classnames";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { Trans, useTranslation } from "react-i18next";
import { OptionsValue } from "@/domains/wallet/hooks";
import { Button } from "@/app/components/Button";

export const MethodStep = ({
	onSelectRegularAddress,
	onSelectHdAddress,
	onImportAddress,
}: {
	profile: Contracts.IProfile;
	network: Networks.Network;
	onSelectRegularAddress?: () => void | Promise<void>;
	onSelectHdAddress?: () => void | Promise<void>;
	onImportAddress?: () => void;
}) => {
	const { t } = useTranslation();

	return (
		<section data-testid="CreateWallet__method-step">
			<div className="space-y-2">
				<Option
					onClick={onSelectRegularAddress}
					option={{
						description: t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.REGULAR_ADDRESS_DESCRIPTION"),
						header: t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.REGULAR_ADDRESS_TITLE"),
						icon: <Icon name="Wallet" size="lg" />,
						label: t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.REGULAR_ADDRESS_TITLE"),
						value: OptionsValue.BIP49,
					}}
				/>
			</div>

			<div
				className={cn(
					"my-2 flex items-center",
					"before:border-theme-secondary-300 dark:before:border-theme-dark-700 dim:before:border-theme-dim-700 before:flex-1 before:border-t before:border-dashed",
					"after:border-theme-secondary-300 dark:after:border-theme-dark-700 dim:after:border-theme-dim-700 after:flex-1 after:border-t after:border-dashed",
				)}
			>
				<span className="text-theme-secondary-500 px-3 text-sm leading-[17px] font-semibold">Advanced</span>
			</div>

			<div className="space-y-2">
				<Option
					onClick={onSelectHdAddress}
					option={{
						description: t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.HD_ADDRESS_TITLE"),
						header: t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.HD_ADDRESS_TITLE"),
						icon: <Icon name="HDWalletImportMethod" size="lg" />,
						label: t("COMMON.HD_WALLET"),
						value: OptionsValue.BIP44,
					}}
				/>
				<div className="bg-theme-secondary-200 dim:bg-theme-dim-950 dark:bg-theme-dark-950 dark:text-theme-dark-200 text-theme-secondary-700 flex items-center space-x-4 rounded-lg px-4 py-3">
					<ThemeIcon
						dimensions={[40, 40]}
						lightIcon="WalletMultipleLight"
						darkIcon="WalletMultipleDark"
						dimIcon="WalletMultipleDim"
					/>

					<div className="text-sm">
						<div>{t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.USE_ADDITIONAL_ADDRESSES")}</div>
						<Trans
							i18nKey="WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.USE_IMPORT"
							components={{
								importLink: (
									<Button
										type="button"
										variant="transparent"
										className="text-theme-navy-600 dim:text-theme-dim-navy-600 p-0 text-sm"
										onClick={onImportAddress}
									>
										{t("COMMON.IMPORT")}
									</Button>
								),
							}}
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

const Option = ({ option, onClick }: { option: ImportOption; onClick?: () => void }) => (
	<button
		type="button"
		onClick={onClick}
		className="group border-theme-primary-200 dark:border-theme-dark-700 dark:hover:bg-theme-dark-700 hover:bg-theme-primary-200 focus:ring-theme-primary-400 dim:border-theme-dim-700 dim-hover:bg-theme-dim-700 flex w-full cursor-pointer flex-col items-start space-y-2 rounded-lg border p-4 focus:ring-2 focus:outline-hidden focus:ring-inset sm:p-6"
	>
		<div className="m-0 flex items-center space-x-3 sm:mb-2">
			{option.icon && (
				<div className="text-theme-primary-600 dark:text-theme-dark-200 group-hover:text-theme-primary-700 dim:text-theme-dim-200 dim:group-hover:text-white">
					{option.icon}
				</div>
			)}
			<div className="text-theme-primary-600 dark:text-theme-dark-50 group-hover:text-theme-primary-700 dim:text-theme-dim-50 dim:group-hover:text-white text-sm leading-5 font-semibold sm:text-base dark:group-hover:text-white">
				{option.label}
			</div>
		</div>
		{option.description && (
			<div className="text-theme-secondary-700 dark:text-theme-dark-200 group-hover:text-theme-primary-500 dim:text-theme-dim-200 hidden text-sm leading-[17px] font-semibold sm:block dark:group-hover:text-white">
				{option.description}
			</div>
		)}
	</button>
);
