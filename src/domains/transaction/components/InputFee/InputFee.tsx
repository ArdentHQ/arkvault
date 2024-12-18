import { isNil } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { InputFeeAdvanced } from "./blocks/InputFeeAdvanced";
import { InputFeeSimple } from "./blocks/InputFeeSimple";
import {
	DEFAULT_SIMPLE_VALUE,
	DEFAULT_VIEW_TYPE,
	InputFeeProperties,
	InputFeeSimpleOptions,
	InputFeeSimpleValue,
	InputFeeViewType,
} from "./InputFee.contracts";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { Switch } from "@/app/components/Switch";

export const InputFee: React.FC<InputFeeProperties> = memo(
	({
		min,
		avg,
		max,
		step,
		disabled,
		network,
		profile,
		loading,
		onChange,
		value,
		...properties
	}: InputFeeProperties) => {
		const { t } = useTranslation();

		const viewType = properties.viewType ?? DEFAULT_VIEW_TYPE;
		const simpleValue = properties.simpleValue ?? DEFAULT_SIMPLE_VALUE;
		const [advancedValue, setAdvancedValue] = useState(value?.toString());

		useEffect(() => {
			if (value && value !== advancedValue) {
				setAdvancedValue(value.toString());
			}
		}, [value]); // eslint-disable-line react-hooks/exhaustive-deps

		useEffect(() => {
			if (avg && isNil(advancedValue)) {
				onChangeAdvancedValue(avg.toString());
			}
		}, [avg, advancedValue]); // eslint-disable-line react-hooks/exhaustive-deps

		const ticker = network.ticker();
		const exchangeTicker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency);
		const { convert } = useExchangeRate({ exchangeTicker, ticker });

		const showConvertedValues = true;

		const options: InputFeeSimpleOptions = {
			[InputFeeSimpleValue.Slow]: {
				displayValue: min,
				displayValueConverted: convert(min),
				label: t("TRANSACTION.FEES.SLOW"),
			},
			[InputFeeSimpleValue.Average]: {
				displayValue: avg,
				displayValueConverted: convert(avg),
				label: t("TRANSACTION.FEES.AVERAGE"),
			},
			[InputFeeSimpleValue.Fast]: {
				displayValue: max,
				displayValueConverted: convert(max),
				label: t("TRANSACTION.FEES.FAST"),
			},
		};

		const onChangeViewType = (newValue: InputFeeViewType) => {
			properties.onChangeViewType?.(newValue);

			const changeFee = {
				[InputFeeViewType.Simple]: () => onChange(options[simpleValue].displayValue.toString()),
				[InputFeeViewType.Advanced]: () => onChange(`${advancedValue}`),
			};

			changeFee[newValue]();
		};

		const onChangeSimpleValue = (newValue: InputFeeSimpleValue) => {
			properties.onChangeSimpleValue?.(newValue);

			const feeValue = options[newValue].displayValue;
			onChange(feeValue?.toString());
		};

		const onChangeAdvancedValue = (newValue: string) => {
			setAdvancedValue(newValue);
			onChange(newValue);
		};

		const renderAdvanced = () => (
			<InputFeeAdvanced
				network={network}
				convert={convert}
				disabled={disabled || loading}
				exchangeTicker={exchangeTicker!}
				onChange={onChangeAdvancedValue}
				showConvertedValue={showConvertedValues}
				step={step}
				value={advancedValue ?? ""}
			/>
		);

		if (disabled) {
			return renderAdvanced();
		}

		return (
			<div data-testid="InputFee" className="relative">
				<div className="absolute right-0 -mt-7">
					<Switch
						disabled={loading}
						size="sm"
						value={viewType}
						onChange={onChangeViewType}
						leftOption={{
							label: t("TRANSACTION.INPUT_FEE_VIEW_TYPE.SIMPLE"),
							value: InputFeeViewType.Simple,
						}}
						rightOption={{
							label: t("TRANSACTION.INPUT_FEE_VIEW_TYPE.ADVANCED"),
							value: InputFeeViewType.Advanced,
						}}
					/>
				</div>

				{viewType === InputFeeViewType.Simple && (
					<InputFeeSimple
						options={options}
						loading={loading || !ticker || !exchangeTicker}
						ticker={ticker}
						exchangeTicker={exchangeTicker!}
						showConvertedValues={showConvertedValues}
						value={simpleValue}
						onChange={onChangeSimpleValue}
					/>
				)}

				{viewType === InputFeeViewType.Advanced && renderAdvanced()}
			</div>
		);
	},
);

InputFee.displayName = "InputFee";
