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

const DateRangeSelection = ({ className, minStartDate }: { className?: string; minStartDate?: Date }) => {
	const form = useFormContext();

	return (
		<div
			className={cn(
				"bg-theme-secondary-background flex w-full flex-col space-y-5 rounded-lg px-5 py-4 md:flex-row md:space-y-0 md:space-x-5",
				className,
			)}
		>
			<div className="md:flex-1">
				<FormField name="from">
					<FormLabel label={t("COMMON.DATE_FROM")} />
					<InputDate
						selectsStart
						minDate={minStartDate}
						endDate={form.watch("to")}
						rules={{ required: true }}
					/>
				</FormField>
			</div>

			<div className="md:flex-1">
				<FormField name="to">
					<FormLabel label={t("COMMON.DATE_TO")} />
					<InputDate
						placement="bottom-end"
						selectsEnd
						minDate={form.watch("from")}
						startDate={form.watch("from")}
						rules={{ required: true }}
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
					"mt-4 flex flex-col space-y-2": isXs,
					"space-x-2": !isXs,
				})}
			>
				{transactionTypeOptions.map(({ label, value, active }) => (
					<ButtonGroupOption
						key={value}
						tooltipContent={label}
						isSelected={() => active}
						setSelectedValue={() => form.setValue("transactionType", value)}
						value={value}
						className="rounded"
						variant="modern"
					>
						<div className="px-2">{label}</div>
					</ButtonGroupOption>
				))}
			</ButtonGroup>
		</div>
	);
};

const DateRangeOptions = ({ isDisabled }: { isDisabled: boolean }) => {
	const form = useFormContext();

	const { options, selected } = useDateRangeOptions({
		selectedValue: form.watch("dateRange"),
	});

	return (
		<FormField name="dateRange">
			<Dropdown
				variant="options"
				wrapperClass="z-50"
				data-testid="TransactionExportForm--daterange-options"
				options={options}
				onSelect={(option) => form.setValue("dateRange", option.value)}
				disableToggle={isDisabled}
				toggleContent={(isOpen: boolean) => (
					<CollapseToggleButton
						isOpen={isOpen}
						disabled={isDisabled}
						className="overflow-hidden justify-between space-x-4 w-full cursor-pointer"
						label={<div className="leading-tight whitespace-nowrap">{selected?.label}</div>}
					/>
				)}
			/>
		</FormField>
	);
};

export const BasicSettings = ({ minStartDate }: { minStartDate?: Date }) => {
	const { t } = useTranslation();

	const { isXs } = useBreakpoint();
	const form = useFormContext();

	const isCustom = form.watch("dateRange") === DateRange.Custom;

	const items = [
		{
			content: isXs && <TransactionTypeOptions />,
			label: t("TRANSACTION.EXPORT.FORM.TRANSACTIONS"),
			value: !isXs && <TransactionTypeOptions />,
			wrapperClass: "pb-4",
		},
		{
			content: isCustom && <DateRangeSelection minStartDate={minStartDate} className="mt-4" />,
			label: t("TRANSACTION.EXPORT.FORM.DATE_RANGE"),
			value: <DateRangeOptions isDisabled={!minStartDate} />,
		},
	];

	return <ListDivided items={items} />;
};
