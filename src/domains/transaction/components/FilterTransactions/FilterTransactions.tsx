import { Contracts } from "@ardenthq/sdk-profiles";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";

import { Dropdown, DropdownOption, DropdownOptionGroup } from "@/app/components/Dropdown";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { useTransactionTypeFilters } from "./use-transaction-type-filters";

interface FilterTransactionsProperties extends JSX.IntrinsicAttributes {
	className?: string;
	defaultSelected?: DropdownOption;
	wallets?: Contracts.IReadWriteWallet[];
	onSelect?: (selectedOption: DropdownOption, types: any, selectedTypes: string[]) => void;
	isDisabled?: boolean;
	selectedTransactionTypes?: string[]
}

const FilterOption = ({ label, isChecked, onChange }: { label: string, isChecked: boolean, onChange?: (isChecked: boolean) => void }) => (
	<span className="flex items-center space-x-2" onClick={() => onChange?.(!isChecked)}>
		<Checkbox checked={isChecked} onChange={() => onChange?.(!isChecked)} />
		<span>{label}</span>
	</span>
)

export const FilterTransactions = memo(
	({ className, onSelect, wallets, isDisabled, selectedTransactionTypes = [], ...properties }: FilterTransactionsProperties) => {
		const { t } = useTranslation();

		const { isAllSelected, isOtherSelected, onToggleAll, onToggleType, onToggleOther, isTypeSelected } = useTransactionTypeFilters({
			onSelect: (selectedTypes: string[]) => {
				onSelect?.({ label: "", value: "" }, undefined, selectedTypes)
			},
			selectedTransactionTypes,
			wallets,
		})

		const options: DropdownOptionGroup[] = [
			{
				key: "all",
				options: [
					{
						label: <FilterOption label={t("COMMON.SELECT_ALL")} isChecked={isAllSelected} onChange={() => onToggleAll(!isAllSelected)} />, value: "all"
					},
				],
			},
			{
				hasDivider: true,
				key: "others",
				options: [
					{
						label: <FilterOption
							label={t("COMMON.TRANSFERS")}
							isChecked={isTypeSelected("transfer")}
							onChange={(isChecked) => onToggleType("transfer", isChecked)} />,
						value: "all"
					},
					{
						label: <FilterOption
							label={t("COMMON.VOTES")}
							isChecked={isTypeSelected("vote")}
							onChange={(isChecked) => onToggleType("vote", isChecked)} />,
						value: "vote"
					},
					{
						label: <FilterOption
							label={t("COMMON.MULTIPAYMENTS")}
							isChecked={isTypeSelected("multiPayment")}
							onChange={(isChecked) => onToggleType("multiPayment", isChecked)} />,
						value: "transfer"
					},
					{
						label: <FilterOption
							label={t("COMMON.OTHERS")}
							isChecked={isOtherSelected}
							onChange={() => onToggleOther(!isOtherSelected)} />,
						value: "transfer"
					}],
			},
		];

		return (
			<div className={className} data-testid="FilterTransactions" {...properties}>
				<Dropdown
					placement="bottom-end"
					wrapperClass="[&>.dropdown-body]:md:max-h-128 [&>.dropdown-body]:md:overflow-y-auto"
					options={options}
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
