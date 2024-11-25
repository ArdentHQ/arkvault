import React from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { useDelimiterOptions } from "./hooks";
import { CollapseToggleButton } from "@/app/components/Collapse";
import { Dropdown } from "@/app/components/Dropdown";
import { FormField } from "@/app/components/Form";
import { Toggle } from "@/app/components/Toggle";
import { CsvDelimiter } from "@/domains/transaction/components/TransactionExportModal";
import { ListDivided } from "@/app/components/ListDivided";

const SelectDelimiterLabel = ({ label, symbol }: { label?: string; symbol?: string }) => (
	<>
		{label}
		<span className="px-1 leading-tight text-theme-secondary-500 dark:text-theme-secondary-600">(</span>
		{symbol}
		<span className="leading-tight text-theme-secondary-500 dark:text-theme-secondary-600">)</span>
	</>
);

const SelectDelimiter = ({ value, onSelect }: { value: CsvDelimiter; onSelect?: (option: CsvDelimiter) => void }) => {
	const delimiterOptions = useDelimiterOptions({ selectedValue: value });

	return (
		<FormField name="delimiter">
			<Dropdown
				wrapperClass="z-50"
				data-testid="TransactionExportForm--delimiter-options"
				options={delimiterOptions.options}
				onSelect={(option) => onSelect?.(option.value as CsvDelimiter)}
				toggleContent={(isOpen: boolean) => (
					<CollapseToggleButton
						isOpen={isOpen}
						className="w-full cursor-pointer justify-between space-x-4 overflow-hidden"
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
	const { setValue, watch } = form;

	return (
		<>
			<div className="mb-4 mt-8 text-lg font-semibold">{t("TRANSACTION.EXPORT.FORM.CSV_SETTINGS")}</div>

			<ListDivided
				items={[
					{
						label: t("TRANSACTION.EXPORT.FORM.INCLUDE_HEADER_ROW"),
						value: (
							<Toggle
								checked={!!watch("includeHeaderRow")}
								data-testid="TransactionExportForm__toggle-include-header-row"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setValue("includeHeaderRow", event.target.checked);
								}}
							/>
						),
						wrapperClass: "pb-4",
					},
					{
						label: t("TRANSACTION.EXPORT.FORM.DELIMITER"),
						value: (
							<SelectDelimiter
								value={watch("delimiter")}
								onSelect={(delimiter) => setValue("delimiter", delimiter)}
							/>
						),
						wrapperClass: "pt-4",
					},
				]}
			/>
		</>
	);
};
