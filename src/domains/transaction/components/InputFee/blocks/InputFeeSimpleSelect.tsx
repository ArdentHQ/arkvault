import React from "react";
import { useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import { Select } from "@/app/components/SelectDropdown";
import { Skeleton } from "@/app/components/Skeleton";
import {
	InputFeeSimpleProperties,
	InputFeeSimpleValue,
} from "@/domains/transaction/components/InputFee/InputFee.contracts";

const feeSelectAddons = ({
	showConvertedValues,
	exchangeTicker,
	value,
	label,
}: {
	showConvertedValues: boolean;
	exchangeTicker: string;
	value: number;
	label: string;
}) => ({
	end: {
		content: showConvertedValues && (
			<div className="whitespace-no-break mr-2 text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
				<Amount ticker={exchangeTicker} value={value} />
			</div>
		),
	},
	start: {
		content: (
			<div className="-ml-4 mr-2 flex h-full items-center rounded-l border-r border-theme-secondary-400 bg-theme-secondary-100 px-4 dark:border-theme-secondary-700 dark:bg-theme-secondary-background">
				{label}
			</div>
		),
	},
});

export const InputFeeSimpleSelect: React.FC<InputFeeSimpleProperties> = ({
	options,
	onChange,
	value,
	ticker,
	exchangeTicker,
	showConvertedValues,
	loading,
}: InputFeeSimpleProperties) => {
	const { t } = useTranslation();

	const labels = {
		[InputFeeSimpleValue.Slow]: t("COMMON.FEE_SLOW"),
		[InputFeeSimpleValue.Average]: t("COMMON.FEE_AVERAGE"),
		[InputFeeSimpleValue.Fast]: t("COMMON.FEE_FAST"),
	};

	if (loading) {
		return <Skeleton className="h-14 w-full" />;
	}

	const handleFeeChange = ({ value }) => {
		// Ensure the value is always one of the allowed values.
		if (!labels[value]) {
			return;
		}

		onChange(value as InputFeeSimpleValue);
	};

	return (
		<Select
			id="InputFeeSimpleSelect__dropdown"
			className="relative"
			readOnly
			showCaret
			allowFreeInput
			value={`${options[value].displayValue} ${ticker}`}
			defaultValue={`${options[value].displayValue} ${ticker}`}
			options={Object.entries(options).map(([optionValue, option]) => ({
				label: `${option.displayValue} ${ticker}`,
				value: optionValue,
			}))}
			onChange={handleFeeChange}
			addons={feeSelectAddons({
				exchangeTicker,
				label: labels[value],
				showConvertedValues,
				value: options[value].displayValueConverted,
			})}
			renderLabel={({ value }) => (
				<div className="flex items-center space-x-3" data-testid="InputFeeSimpleSelect--option">
					<div className="w-12 border-r border-theme-secondary-300 pr-2 dark:border-theme-secondary-700">
						{labels[value]}
					</div>

					<Amount ticker={ticker} value={options[value].displayValue} className="text-md" />

					{showConvertedValues && (
						<Amount
							ticker={exchangeTicker}
							value={options[value].displayValueConverted}
							className="text-sm text-theme-secondary-500"
						/>
					)}
				</div>
			)}
		/>
	);
};
