import { Networks } from "@ardenthq/sdk";
import React from "react";

import { ImportOption, useImportOptions } from "@/domains/wallet/hooks/use-import-options";
import { useFormContext } from "react-hook-form";

export const MethodStep = ({ network, onSelect }: { network: Networks.Network, onSelect: () => Promise<void> }) => {
	const { options } = useImportOptions(network.importMethods());

	const form = useFormContext();

	const { setValue, clearErrors } = form;

	const onOptionSelect = (option: ImportOption) => {
		setValue("importOption", option, { shouldDirty: true, shouldValidate: true });
		setValue("value", undefined);
		clearErrors("value");

		void onSelect();
	}

	return (
		<section data-testid="ImportWallet__method-step">
			<div className="mt-4 space-y-2">
				{options.map((option, index) => <Option onSelect={onOptionSelect} option={option} key={index} />)}
			</div>
		</section>
	);
};

const Option = ({option, onSelect}: {option: ImportOption, onSelect: (option: ImportOption) => void}) => {
	return <div onClick={() => onSelect(option)} tabIndex={0} className="border-theme-primary-200 dark:border-theme-dark-700 rounded-lg p-4 sm:p-6 border space-y-2 cursor-pointer hover:bg-theme-primary-200 dark:hover:bg-theme-dark-700 group">
		<div className="space-x-2  flex items-center ">
			{option.icon && <div className="text-theme-primary-600 dark:text-theme-dark-200 group-hover:text-theme-primary-700 dark:group-hover:text-white">{option.icon}</div>}
			<div className="font-semibold leading-5 text-theme-primary-600 dark:text-theme-dark-50 group-hover:text-theme-primary-700 dark:group-hover:text-white">{option.label}</div>
		</div>
		{option.description && <div className="hidden sm:block font-semibold text-sm leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200 group-hover:text-theme-primary-500 dark:group-hover:text-white">{option.description}</div>}
	</div>
}
