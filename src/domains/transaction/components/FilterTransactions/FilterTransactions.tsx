import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { CollapseToggleButton } from "@/app/components/Collapse";
import { Dropdown, DropdownOption, DropdownOptionGroup } from "@/app/components/Dropdown";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";

interface FilterTransactionsProperties extends JSX.IntrinsicAttributes {
	className?: string;
	defaultSelected?: DropdownOption;
	wallets?: Contracts.IReadWriteWallet[];
	onSelect?: (selectedOption: DropdownOption, types: any) => void;
	isDisabled?: boolean;
}

export const FilterTransactions = memo(
	({ className, onSelect, defaultSelected, wallets, isDisabled, ...properties }: FilterTransactionsProperties) => {
		const { t } = useTranslation();
		const { types, getLabel, canViewMagistrate } = useTransactionTypes({ wallets });

		const allOptions: DropdownOptionGroup[] = useMemo(() => {
			const options: DropdownOptionGroup[] = [
				{
					key: "all",
					options: [{ label: t("COMMON.ALL"), value: "all" }],
				},
				{
					hasDivider: true,
					key: "core",
					options: types.core.map((type) => ({ label: getLabel(type), value: type })),
					title: t("TRANSACTION.CORE"),
				},
			];

			if (canViewMagistrate) {
				options.push({
					hasDivider: true,
					key: "magistrate",
					options: [
						{
							label: t("TRANSACTION.MAGISTRATE"),
							value: "magistrate",
						},
					],
				});
			}

			return options;
		}, [getLabel, types, t, canViewMagistrate]);

		const [selectedOption, setSelectedOption] = useState<DropdownOption>(
			defaultSelected || allOptions[0].options[0],
		);

		const handleSelect = (selectedOption: DropdownOption) => {
			setSelectedOption(selectedOption);
			onSelect?.(selectedOption, selectedOption.value);
		};

		return (
			<div className={className} data-testid="FilterTransactions" {...properties}>
				<Dropdown
					dropdownClass="md:w-80 md:max-h-128 md:overflow-y-auto md:w-auto mx-4 sm:w-full sm:mx-0"
					options={allOptions}
					disableToggle={isDisabled}
					toggleContent={(isOpen: boolean) => (
						<CollapseToggleButton
							disabled={isDisabled}
							isOpen={isOpen}
							className={cn(
								"w-full cursor-pointer justify-between space-x-4 overflow-hidden rounded-xl border border-theme-success-100 p-3 dark:border-theme-secondary-800 sm:p-6 md:w-auto md:space-x-2 md:rounded md:border-0 md:border-none md:px-0 md:py-2",
								{
									"cursor-not-allowed text-theme-secondary-400 dark:text-theme-secondary-800":
										isDisabled,
								},
							)}
							label={
								<>
									<span
										className={cn("leading-tight", {
											"text-theme-secondary-500 dark:text-theme-secondary-600": !isDisabled,
										})}
									>
										{t("COMMON.TYPE")}:
									</span>{" "}
									<span className="whitespace-nowrap leading-tight">{selectedOption.label}</span>
								</>
							}
						/>
					)}
					onSelect={handleSelect}
				/>
			</div>
		);
	},
);

FilterTransactions.displayName = "FilterTransactions";
