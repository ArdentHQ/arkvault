import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useTransactionTypeOptions, useDateRangeOptions } from "./hooks";
import { ButtonGroup, ButtonGroupOption } from "@/app/components/ButtonGroup";
import { CollapseToggleButton } from "@/app/components/Collapse";
import { Dropdown } from "@/app/components/Dropdown";
import { FormField } from "@/app/components/Form";
import { ListDivided } from "@/app/components/ListDivided";

export const BasicSettings = () => {
	const { t } = useTranslation();

	const form = useFormContext();

	const { options: transactionTypeOptions } = useTransactionTypeOptions({
		selectedValue: form.watch("transactionType"),
	});

	const { options: dateRangeOptions, selected: selectedDate } = useDateRangeOptions({
		selectedValue: form.watch("dateRange"),
	});

	return (
		<ListDivided
			items={[
				{
					label: t("TRANSACTION.EXPORT.FORM.TRANSACTIONS"),
					value: (
						<div>
							<ButtonGroup className="space-x-3">
								{transactionTypeOptions.map(({ label, value, active }) => (
									<ButtonGroupOption
										key={value}
										tooltipContent={label}
										isSelected={() => active}
										setSelectedValue={() => form.setValue("transactionType", value)}
										value={value}
										variant="modern"
									>
										<div className="px-2">{label}</div>
									</ButtonGroupOption>
								))}
							</ButtonGroup>
						</div>
					),
					wrapperClass: "py-4",
				},
				{
					label: t("TRANSACTION.EXPORT.FORM.DATE_RANGE"),
					value: (
						<FormField name="dateRange">
							<Dropdown
								data-testid="TransactionExportForm--daterange-options"
								options={dateRangeOptions}
								onSelect={(option) => form.setValue("dateRange", option.value)}
								toggleContent={(isOpen: boolean) => (
									<CollapseToggleButton
										isOpen={isOpen}
										className="w-full cursor-pointer justify-between space-x-4 overflow-hidden rounded-xl border border-theme-success-100 p-3 dark:border-theme-secondary-800 sm:p-6 md:w-auto md:space-x-2 md:rounded md:border-0 md:border-none md:py-2 md:px-0"
										label={
											<div className="whitespace-nowrap leading-tight">{selectedDate?.label}</div>
										}
									/>
								)}
							/>
						</FormField>
					),
					wrapperClass: "pt-4",
				},
			]}
		/>
	);
};
