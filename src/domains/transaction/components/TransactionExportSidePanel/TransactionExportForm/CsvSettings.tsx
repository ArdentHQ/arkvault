import React from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import cn from "classnames";
import { useDelimiterOptions } from "./hooks";
import { SelectOption } from "./SelectOption";
import { CollapseToggleButton } from "@/app/components/Collapse";
import { DropdownRoot, DropdownToggle, DropdownContent } from "@/app/components/SimpleDropdown";
import { FormField } from "@/app/components/Form";
import { Toggle } from "@/app/components/Toggle";
import { CsvDelimiter } from "@/domains/transaction/components/TransactionExportSidePanel";
import { ListDivided } from "@/app/components/ListDivided";

const SelectDelimiterLabel = ({ label, symbol }: { label?: string; symbol?: string }) => (
	<>
		{label}
		<span className="ml-1 leading-tight text-theme-secondary-500 dark:text-theme-secondary-600">(</span>
		{symbol}
		<span className="leading-tight text-theme-secondary-500 dark:text-theme-secondary-600">)</span>
	</>
);

interface SelectDelimiterOptionProperties extends React.HTMLProps<HTMLLIElement> {
	label: string;
	symbol: string;
	isActive: boolean;
}

const SelectDelimiterOption = ({ label, symbol, isActive, ...props }: SelectDelimiterOptionProperties) => (
	<SelectOption isActive={isActive} {...props}>
		<span className="flex items-center space-x-4">
			<span className="w-20">{label}</span>
			<span
				className={cn("w-8 whitespace-pre text-right", {
					"font-normal text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-dark-50": !isActive,
				})}
			>
				<span className="text-theme-secondary-500 dim:text-theme-dim-500 dark:text-theme-dark-500">(</span>
				{` ${symbol} `}
				<span className="text-theme-secondary-500 dim:text-theme-dim-500 dark:text-theme-dark-500">)</span>
			</span>
		</span>
	</SelectOption>
);

const SelectDelimiter = ({ value, onSelect }: { value: CsvDelimiter; onSelect?: (option: CsvDelimiter) => void }) => {
	const delimiterOptions = useDelimiterOptions({ selectedValue: value });

	return (
		<FormField name="delimiter" data-testid="TransactionExportForm--delimiter">
			<DropdownRoot>
				<DropdownToggle>
					{({ isOpen }: { isOpen: boolean }) => (
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
				</DropdownToggle>
				<DropdownContent className="z-[52] py-1">
					<ul>
						{delimiterOptions.options.map((option, index) => (
							<SelectDelimiterOption
								key={option.value}
								label={option.label}
								symbol={option.symbol}
								isActive={option.active}
								data-testid={`dropdown__option--${index}`}
								onClick={() => onSelect?.(option.value)}
							/>
						))}
					</ul>
				</DropdownContent>
			</DropdownRoot>
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
					},
				]}
			/>
		</>
	);
};
