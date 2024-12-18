import { Dropdown, DropdownOption, DropdownOptionGroup } from "@/app/components/Dropdown";
import React, { memo } from "react";

import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { Contracts } from "@ardenthq/sdk-profiles";
import classNames from "classnames";
import { useTransactionTypeFilters } from "./use-transaction-type-filters";
import { useTranslation } from "react-i18next";

interface FilterTransactionsProperties extends JSX.IntrinsicAttributes {
	className?: string;
	defaultSelected?: DropdownOption;
	wallets?: Contracts.IReadWriteWallet[];
	onSelect?: (selectedOption: DropdownOption, types: any, selectedTypes: string[]) => void;
	isDisabled?: boolean;
	selectedTransactionTypes?: string[];
}

const FilterOption = ({
	label,
	isChecked,
	onChange,
	hasDivider,
}: {
	label: string;
	isChecked: boolean;
	onChange?: (isChecked: boolean) => void;
	hasDivider?: boolean;
}) => (
	<span
		data-testid="FilterOption"
		className={classNames("group -my-4 -ml-9 -mr-8 flex w-screen items-center space-x-2 px-4 py-3 transition-all", {
			"border-b border-theme-secondary-300 dark:border-theme-secondary-600": hasDivider,
			"font-normal hover:text-theme-secondary-900 dark:hover:text-theme-secondary-200": !isChecked,
			"font-semibold hover:text-theme-primary-600": isChecked,
		})}
		onClick={() => onChange?.(!isChecked)}
	>
		<Checkbox
			checked={isChecked}
			onChange={() => onChange?.(!isChecked)}
			data-testid={`FilterOption__checkbox`}
			className={classNames("transition-all", {
				"group-hover:bg-theme-primary-700": isChecked,
				"group-hover:border-theme-primary-600 dark:group-hover:border-theme-primary-600": !isChecked,
			})}
		/>
		<span data-testid={`FilterOption__${label}`}>{label}</span>
	</span>
);

export const FilterTransactions = memo(
	({
		className,
		onSelect,
		wallets,
		isDisabled,
		selectedTransactionTypes = [],
		...properties
	}: FilterTransactionsProperties) => {
		const { t } = useTranslation();

		const { isAllSelected, isOtherSelected, onToggleAll, onToggleType, onToggleOther, isTypeSelected } =
			useTransactionTypeFilters({
				onSelect: (selectedTypes: string[]) => {
					onSelect?.({ label: "", value: "" }, undefined, selectedTypes);
				},
				selectedTransactionTypes,
				wallets,
			});

		const options: DropdownOptionGroup[] = [
			{
				key: "all",
				options: [
					{
						element: (
							<FilterOption
								label={t("COMMON.SELECT_ALL")}
								isChecked={isAllSelected}
								onChange={() => onToggleAll(!isAllSelected)}
								hasDivider
							/>
						),
						label: "",
						value: "all",
					},
				],
			},
			{
				key: "others",
				options: [
					{
						element: (
							<FilterOption
								label={t("COMMON.TRANSFERS")}
								isChecked={isTypeSelected("transfer")}
								onChange={(isChecked) => onToggleType("transfer", isChecked)}
							/>
						),
						label: "",
						value: "transfer",
					},
					{
						element: (
							<FilterOption
								label={t("COMMON.VOTES")}
								isChecked={isTypeSelected("vote")}
								onChange={(isChecked) => onToggleType("vote", isChecked)}
							/>
						),
						label: "",
						value: "vote",
					},
					{
						element: (
							<FilterOption
								label={t("COMMON.MULTIPAYMENTS")}
								isChecked={isTypeSelected("multiPayment")}
								onChange={(isChecked) => onToggleType("multiPayment", isChecked)}
							/>
						),
						label: "",
						value: "transfer",
					},
					{
						element: (
							<FilterOption
								label={t("COMMON.OTHERS")}
								isChecked={isOtherSelected}
								onChange={() => onToggleOther(!isOtherSelected)}
							/>
						),
						label: "",
						value: "transfer",
					},
				],
			},
		];

		return (
			<div className={className} data-testid="FilterTransactions" {...properties}>
				<Dropdown
					placement="bottom-end"
					wrapperClass="sm:max-w-56"
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
