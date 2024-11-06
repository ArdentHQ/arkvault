import { Contracts } from "@ardenthq/sdk-profiles";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Dropdown, DropdownOption, DropdownOptionGroup } from "@/app/components/Dropdown";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";

interface FilterTransactionsProperties extends JSX.IntrinsicAttributes {
	className?: string;
	defaultSelected?: DropdownOption;
	wallets?: Contracts.IReadWriteWallet[];
	onSelect?: (selectedOption: DropdownOption, types: any, selectedTypes: string[]) => void;
	isDisabled?: boolean;
	selectedTransactionTypes?: string[]
	onDiselectAll?: () => void
}

const FilterOption = ({ label, isChecked, onChange }: { label: string, isChecked: boolean, onChange?: (isChecked: boolean) => void }) => (
	<span className="flex items-center space-x-2" onClick={() => onChange?.(!isChecked)}>
		<Checkbox checked={isChecked} onChange={() => onChange?.(!isChecked)} />
		<span>{label}</span>
	</span>
)

export const FilterTransactions = memo(
	({ className, onSelect, wallets, isDisabled, selectedTransactionTypes = [], onDiselectAll, ...properties }: FilterTransactionsProperties) => {
		const { t } = useTranslation();
		const { types, getLabel, canViewMagistrate } = useTransactionTypes({ wallets });
		const allTypes = [...types.core, ...types.magistrate]

		const allOptions: DropdownOptionGroup[] = useMemo(() => {

			const isAllSelected = [allTypes.every(type => selectedTransactionTypes.includes(type))].some(Boolean)

			const onToggleAll = (isChecked: boolean) => {
				onSelect?.({ label: "", value: "" }, undefined, allTypes)

				if (!isChecked) {
					onSelect?.({ label: "", value: "" }, undefined, [])
				}
			}

			const onToggle = (value: string, label: string) => (isChecked: boolean) => {
				if (!isChecked) {
					onSelect({ label, value }, undefined, selectedTransactionTypes.filter(type => type !== value))
					return
				}

				onSelect({ label, value }, undefined, [...selectedTransactionTypes, value])
			}

			const options: DropdownOptionGroup[] = [
				{
					key: "all",
					options: [{
						label: <FilterOption label={t("COMMON.ALL")} isChecked={isAllSelected} onChange={() => onToggleAll(!isAllSelected)} />, value: "all"
					}],
				},
				{
					hasDivider: true,
					key: "core",
					options: types.core.map((type) => ({ label: <FilterOption label={getLabel(type)} onChange={onToggle(type, getLabel(type))} isChecked={selectedTransactionTypes.includes(type)} />, value: type })),
					title: t("TRANSACTION.CORE"),
				},
			];

			if (canViewMagistrate) {
				options.push({
					hasDivider: true,
					key: "magistrate",
					options: [
						{
							label: <FilterOption label={t("TRANSACTION.MAGISTRATE")} isChecked={selectedTransactionTypes.includes("magistrate")} onChange={onToggle("magistrate", t("TRANSACTION.MAGISTRATE"))} />,
							value: "magistrate",
						},
					],
				});
			}

			return options;
		}, [getLabel, types, t, canViewMagistrate, selectedTransactionTypes]);

		return (
			<div className={className} data-testid="FilterTransactions" {...properties}>
				<Dropdown
					placement="bottom-end"
					wrapperClass="[&>.dropdown-body]:md:max-h-[42rem] [&>.dropdown-body]:md:overflow-y-auto min-w-52"
					options={allOptions}
					disableToggle={isDisabled}
					closeOnSelect={false}
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
				/>
			</div>
		);
	},
);

FilterTransactions.displayName = "FilterTransactions";
