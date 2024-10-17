import { Contracts } from "@ardenthq/sdk-profiles";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Dropdown, DropdownOption, DropdownOptionGroup } from "@/app/components/Dropdown";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { Button } from "@/app/components/Button";

interface FilterTransactionsProperties extends JSX.IntrinsicAttributes {
	className?: string;
	defaultSelected?: DropdownOption;
	wallets?: Contracts.IReadWriteWallet[];
	onSelect?: (selectedOption: DropdownOption, types: any) => void;
	isDisabled?: boolean;
}

export const FilterTransactions = memo(
	({ className, onSelect, wallets, isDisabled, ...properties }: FilterTransactionsProperties) => {
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

		const handleSelect = (selectedOption: DropdownOption) => {
			onSelect?.(selectedOption, selectedOption.value);
		};

		return (
			<div className={className} data-testid="FilterTransactions" {...properties}>
				<Dropdown
					placement="bottom-end"
					options={allOptions}
					disableToggle={isDisabled}
					toggleContent={
						<Button
							variant="secondary"
							size="sm"
							icon="Funnel"
							iconSize="md"
							className="w-full px-4 py-1.5 text-base sm:w-fit"
							disabled={isDisabled}
							data-testid="CollapseToggleButton"
						>
							<span>{t("COMMON.TYPE")}</span>
						</Button>
					}
					onSelect={handleSelect}
				/>
			</div>
		);
	},
);

FilterTransactions.displayName = "FilterTransactions";
