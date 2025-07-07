import { Networks } from "@/app/lib/mainsail";
import React from "react";

import { ImportOption, useImportOptions } from "@/domains/wallet/hooks/use-import-options";
import { useFormContext } from "react-hook-form";

export const MethodStep = ({ network, onSelect }: { network: Networks.Network; onSelect: () => Promise<void> }) => {
	const { options } = useImportOptions(network.importMethods());

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
