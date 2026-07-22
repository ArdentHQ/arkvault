import { DropdownOption, DropdownOptionGroup } from "@/app/components/Dropdown/Dropdown.contracts";
import { DropdownRoot, DropdownToggle, DropdownContent, DropdownListItem } from "@/app/components/SimpleDropdown";
import React, { memo, JSX } from "react";

import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { Contracts } from "@/app/lib/profiles";
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
		className={classNames("group -my-1 flex w-screen items-center space-x-2 transition-all", {
			"border-b border-theme-secondary-300 dim:border-theme-dim-600 dark:border-theme-secondary-600": hasDivider,
			"font-normal hover:text-theme-secondary-900 dark:hover:text-theme-secondary-200": !isChecked,
			"font-semibold hover:text-theme-navy-600": isChecked,
		})}
		onClick={() => onChange?.(!isChecked)}
	>
		<Checkbox
			checked={isChecked}
			onChange={() => onChange?.(!isChecked)}
			data-testid={`FilterOption__checkbox`}
			className={classNames("transition-all", {
				"group-hover:bg-theme-navy-700": isChecked,
				"group-hover:border-theme-navy-600 dark:group-hover:border-theme-navy-600": !isChecked,
			})}
			onKeyDown={(event) => {
				/* istanbul ignore next -- @preserve */
				if (event.key === "Enter" || event.key === " ") {
					onChange?.(!isChecked);
				}
			}}
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
						disableFocus: true,
						element: (
							<div className="flex w-full flex-col">
								<FilterOption
									label={t("COMMON.SELECT_ALL")}
									isChecked={isAllSelected}
									onChange={() => onToggleAll(!isAllSelected)}
								/>

								<hr className="-mx-7 -mb-3.5 mt-3.5 border-b-0 border-t border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700" />
							</div>
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
						disableFocus: true,
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
						disableFocus: true,
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
						disableFocus: true,
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
						disableFocus: true,
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
				title: t("COMMON.TYPES"),
			},
		];

		return (
			<div className={className} data-testid="FilterTransactions" {...properties}>
				<DropdownRoot>
					<DropdownToggle>
						<Button
							variant="secondary"
							size="sm"
							icon="Funnel"
							iconSize="md"
							className="w-full px-4 py-1.5 text-base dark:hover:bg-theme-dark-navy-700 sm:w-fit"
							disabled={isDisabled}
							data-testid="CollapseToggleButton"
						>
							<span>{t("COMMON.TYPE")}</span>
						</Button>
					</DropdownToggle>
					<DropdownContent className="sm:max-w-56">
						{options.map((group) => (
							<div key={group.key}>
								{group.hasDivider && (
									<div>
										<div className="h-px w-full bg-theme-secondary-300 dim:bg-theme-dim-700 dark:bg-theme-dark-700" />
									</div>
								)}
								<ul>
									{group.title && (
										<li className="mx-1 my-1 block whitespace-nowrap rounded-lg bg-theme-primary-50 px-5 py-1 text-left text-xs font-semibold text-theme-secondary-700 dim:bg-theme-dim-navy-900 dim:text-theme-dim-200 dark:bg-theme-dark-800 dark:text-theme-dark-200">
											{group.title}
										</li>
									)}
									{group.options.map((option, index) => (
										<DropdownListItem
											key={option.value}
											data-testid={`dropdown__option--${group.key ? group.key + "-" : ""}${index}`}
											tabIndex={option.disableFocus ? -1 : 0}
											disabled={option.disabled}
											onClick={() => {
												if (!option.disabled && group.onSelect) {
													group.onSelect(option);
												}
											}}
										>
											{option.element || option.label}
										</DropdownListItem>
									))}
								</ul>
							</div>
						))}
					</DropdownContent>
				</DropdownRoot>
			</div>
		);
	},
);

FilterTransactions.displayName = "FilterTransactions";
