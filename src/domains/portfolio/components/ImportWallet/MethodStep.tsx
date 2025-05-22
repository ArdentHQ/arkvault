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
		className="flex flex-col items-start p-4 space-y-2 w-full rounded-lg border cursor-pointer sm:p-6 focus:ring-2 focus:ring-inset group border-theme-primary-200 dark:border-theme-dark-700 dark:hover:bg-theme-dark-700 hover:bg-theme-primary-200 focus:ring-theme-primary-400 focus:outline-hidden"
	>
		<div className="flex items-center space-x-2">
			{option.icon && (
				<div className="text-theme-primary-600 dark:text-theme-dark-200 dark:group-hover:text-white group-hover:text-theme-primary-700">
					{option.icon}
				</div>
			)}
			<div className="font-semibold leading-5 text-theme-primary-600 dark:text-theme-dark-50 dark:group-hover:text-white group-hover:text-theme-primary-700">
				{option.label}
			</div>
		</div>
		{option.description && (
			<div className="hidden text-sm font-semibold sm:block text-theme-secondary-700 leading-[17px] dark:text-theme-dark-200 dark:group-hover:text-white group-hover:text-theme-primary-500">
				{option.description}
			</div>
		)}
	</button>
);
