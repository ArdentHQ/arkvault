import React from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { useDelimiterOptions } from "./hooks";
import { CollapseToggleButton } from "@/app/components/Collapse";
import { Dropdown } from "@/app/components/Dropdown";
import { FormField } from "@/app/components/Form";
import { Toggle } from "@/app/components/Toggle";
import { CSVDelimiter } from "@/domains/transaction/components/TransactionExportModal";
import { ListDivided } from "@/app/components/ListDivided";

const SelectDelimiterLabel = ({ label, symbol }: { label?: string; symbol?: string }) => (
	<>
		{label}
		<span className="px-1 leading-tight text-theme-secondary-500 dark:text-theme-secondary-600">(</span>
		{symbol}
		<span className="leading-tight text-theme-secondary-500 dark:text-theme-secondary-600">)</span>
	</>
);

const SelectDelimiter = ({ value, onSelect }: { value: CSVDelimiter; onSelect?: (option: CSVDelimiter) => void }) => {
	const delimiterOptions = useDelimiterOptions({ selectedValue: value });

	return (
		<FormField name="delimiter">
			<Dropdown
				data-testid="TransactionExportForm--delimiter-options"
				options={delimiterOptions.options}
				onSelect={(option) => onSelect?.(option.value as CSVDelimiter)}
				toggleContent={(isOpen: boolean) => (
					<CollapseToggleButton
						isOpen={isOpen}
						className="w-full cursor-pointer justify-between space-x-4 overflow-hidden rounded-xl border border-theme-success-100 p-3 dark:border-theme-secondary-800 sm:p-6 md:w-auto md:space-x-2 md:rounded md:border-0 md:border-none md:py-2 md:px-0"
						label={
							<SelectDelimiterLabel
								label={delimiterOptions.selected?.label}
								symbol={delimiterOptions.selected?.symbol}
							/>
						}
					/>
				)}
			/>
		</FormField>
	);
};

export const CSVSettings = () => {
	const { t } = useTranslation();
	const form = useFormContext();

	return (
		<ListDivided
			items={[
				{
					label: t("TRANSACTION.EXPORT.FORM.INCLUDE_HEADER_ROW"),
					value: (
						<Toggle
							ref={form.register()}
							name="includeHeaderRow"
							defaultChecked={!!form.getValues("includeHeaderRow")}
							data-testid="TransactionExportForm__toggle-include-header-row"
						/>
					),
					wrapperClass: "py-4",
				},
				{
					label: t("TRANSACTION.EXPORT.FORM.DELIMITER"),
					value: (
						<SelectDelimiter
							value={form.watch("delimiter")}
							onSelect={(delimiter) => form.setValue("delimiter", delimiter)}
						/>
					),
					wrapperClass: "pt-4",
				},
			]}
		/>
	);
};
