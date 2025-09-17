import { Networks } from "@/app/lib/mainsail";
import React from "react";
import { Contracts } from "@/app/lib/profiles";

import { ImportOption } from "@/domains/wallet/hooks/use-import-options";
import { useFormContext } from "react-hook-form";
import cn from "classnames";
import { Icon } from "@/app/components/Icon";
import { useTranslation } from "react-i18next";
import { OptionsValue } from "@/domains/wallet/hooks";

export const MethodStep = ({
	onSelect,
}: {
	profile: Contracts.IProfile;
	network: Networks.Network;
	onSelect: () => Promise<void>;
}) => {
	const { t } = useTranslation();
	const form = useFormContext();
	const { setValue, clearErrors } = form;

	const onOptionSelect = (option: ImportOption) => {
		setValue("importOption", option, { shouldDirty: true, shouldValidate: true });
		setValue("value", undefined);
		setValue("useEncryption", undefined);
		clearErrors("value");

		void onSelect();
	};

	return (
		<section data-testid="ImportWallet__method-step">
			<div className="space-y-2">
				<Option
					onSelect={onOptionSelect}
					option={{
						description: t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.REGULAR_ADDRESS_DESCRIPTION"),
						header: t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.REGULAR_ADDRESS_TITLE"),
						icon: <Icon name="MnemonicImportMethod" size="lg" />,
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
					onSelect={onOptionSelect}
					option={{
						description: t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.HD_ADDRESS_DESCRIPTION"),
						header: t("WALLETS.PAGE_CREATE_WALLET.METHOD_STEP.HD_ADDRESS_TITLE"),
						icon: <Icon name="HDWalletImportMethod" size="lg" />,
						label: t("COMMON.HD_WALLET"),
						value: OptionsValue.BIP44,
					}}
				/>
			</div>
		</section>
	);
};

const Option = ({ option, onSelect }: { option: ImportOption; onSelect: (option: ImportOption) => void }) => (
	<button
		onClick={() => onSelect(option)}
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
