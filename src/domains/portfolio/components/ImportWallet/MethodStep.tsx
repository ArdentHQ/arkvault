import { Networks } from "@/app/lib/mainsail";
import React from "react";
import { Contracts } from "@/app/lib/profiles";

import { ImportOption, useImportOptions } from "@/domains/wallet/hooks/use-import-options";
import { useFormContext } from "react-hook-form";
import cn from "classnames";

export const MethodStep = ({
	network,
	onSelect,
	profile,
}: {
	profile: Contracts.IProfile;
	network: Networks.Network;
	onSelect: () => Promise<void>;
}) => {
	const { options, advancedOptions } = useImportOptions(network.importMethods(), profile);

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
				{options.map((option, index) => (
					<Option onSelect={onOptionSelect} option={option} key={index} />
				))}
			</div>

			{advancedOptions.length > 0 && (
				<>
					<div
						className={cn(
							"my-2 flex items-center",
							"before:flex-1 before:border-t before:border-dashed before:border-theme-secondary-300 dim:before:border-theme-dim-700 dark:before:border-theme-dark-700",
							"after:flex-1 after:border-t after:border-dashed after:border-theme-secondary-300 dim:after:border-theme-dim-700 dark:after:border-theme-dark-700",
						)}
					>
						<span className="px-3 text-sm font-semibold leading-[17px] text-theme-secondary-500">
							Advanced
						</span>
					</div>
					<div className="space-y-2">
						{advancedOptions.map((option, index) => (
							<Option onSelect={onOptionSelect} option={option} key={index} />
						))}
					</div>
				</>
			)}
		</section>
	);
};

const Option = ({ option, onSelect }: { option: ImportOption; onSelect: (option: ImportOption) => void }) => (
	<button
		onClick={() => onSelect(option)}
		className="focus:outline-hidden group flex w-full cursor-pointer flex-col items-start space-y-2 rounded-lg border border-theme-primary-200 p-4 hover:bg-theme-primary-200 focus:ring-2 focus:ring-inset focus:ring-theme-primary-400 dim:border-theme-dim-700 dim-hover:bg-theme-dim-700 dark:border-theme-dark-700 dark:hover:bg-theme-dark-700 sm:p-6"
	>
		<div className="m-0 flex items-center space-x-3 sm:mb-2">
			{option.icon && (
				<div className="text-theme-primary-600 group-hover:text-theme-primary-700 dim:text-theme-dim-200 dim:group-hover:text-white dark:text-theme-dark-200">
					{option.icon}
				</div>
			)}
			<div className="text-sm font-semibold leading-5 text-theme-primary-600 group-hover:text-theme-primary-700 dim:text-theme-dim-50 dim:group-hover:text-white dark:text-theme-dark-50 dark:group-hover:text-white sm:text-base">
				{option.label}
			</div>
		</div>
		{option.description && (
			<div className="hidden text-sm font-semibold leading-[17px] text-theme-secondary-700 group-hover:text-theme-primary-500 dim:text-theme-dim-200 dark:text-theme-dark-200 dark:group-hover:text-white sm:block">
				{option.description}
			</div>
		)}
	</button>
);
