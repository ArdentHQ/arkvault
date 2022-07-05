import React from "react";
import cn from "classnames";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useTransactionTypeOptions, useDateRangeOptions } from "./hooks";
import { ButtonGroup, ButtonGroupOption } from "@/app/components/ButtonGroup";
import { CollapseToggleButton } from "@/app/components/Collapse";
import { Dropdown } from "@/app/components/Dropdown";
import { FormField, FormLabel } from "@/app/components/Form";
import { ListDivided } from "@/app/components/ListDivided";
import { useBreakpoint } from "@/app/hooks";
import { DateRange } from "@/domains/transaction/components/TransactionExportModal/TransactionExportModal.contracts";
import { InputDate } from "@/app/components/Input";

const DateRangeSelection = ({ className }: { className?: string }) => {
	const form = useFormContext();

	return (
		<div
			className={cn(
				"flex w-full space-x-5 rounded-lg bg-theme-secondary-100 px-5 py-4 dark:bg-theme-secondary-800",
				className,
			)}
		>
			<div className="flex-1">
				<FormField name="from">
					<FormLabel label={t("COMMON.FROM")} />
					<InputDate selectsStart endDate={form.watch("to")} />
				</FormField>
			</div>

			<div className="flex-1">
				<FormField name="to">
					<FormLabel label={t("COMMON.TO")} />
					<InputDate
						placement="bottom-end"
						minDate={form.watch("from")}
						startDate={form.watch("from")}
						selectsEnd
					/>
				</FormField>
			</div>
		</div>
	);
};

const TransactionTypeOptions = () => {
	const { isXs } = useBreakpoint();

	const form = useFormContext();

	const { options: transactionTypeOptions } = useTransactionTypeOptions({
		selectedValue: form.watch("transactionType"),
	});

	return (
		<div>
			<ButtonGroup
				className={cn({
					"mt-4 flex flex-col space-y-3": isXs,
					"space-x-3": !isXs,
				})}
			>
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
	);
};

const DateRangeOptions = () => {
	const form = useFormContext();

	const { options, selected } = useDateRangeOptions({
		selectedValue: form.watch("dateRange"),
	});

	return (
		<FormField name="dateRange">
			<Dropdown
				variant="options"
				data-testid="TransactionExportForm--daterange-options"
				options={options}
				onSelect={(option) => form.setValue("dateRange", option.value)}
				toggleContent={(isOpen: boolean) => (
					<CollapseToggleButton
						isOpen={isOpen}
						className="w-full cursor-pointer justify-between space-x-4 overflow-hidden"
						label={<div className="whitespace-nowrap leading-tight">{selected?.label}</div>}
					/>
				)}
			/>
		</FormField>
	);
};

export const BasicSettings = () => {
	const { t } = useTranslation();

	const { isXs } = useBreakpoint();
	const form = useFormContext();

	const isCustom = form.watch("dateRange") == DateRange.Custom;

	const items = [
		{
			content: isXs && <TransactionTypeOptions />,
			label: t("TRANSACTION.EXPORT.FORM.TRANSACTIONS"),
			value: !isXs && <TransactionTypeOptions />,
			wrapperClass: "pb-4",
		},
		{
			content: isCustom && <DateRangeSelection className="mt-4" />,
			label: t("TRANSACTION.EXPORT.FORM.DATE_RANGE"),
			value: <DateRangeOptions />,
			wrapperClass: "pt-4",
		},
	];

	return <ListDivided items={items} />;
};
