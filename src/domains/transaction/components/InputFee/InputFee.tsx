import { BigNumber } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";

import { InputFeeAdvanced } from "./blocks/InputFeeAdvanced";
import { InputFeeSimple } from "./blocks/InputFeeSimple";
import {
	DEFAULT_FEE_OPTION,
	DEFAULT_VIEW_TYPE,
	InputFeeOption,
	InputFeeOptions,
	InputFeeProperties,
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
		onChangeGasPrice,
		onChangeGasLimit,
		gasPrice,
		gasLimit,
		...properties
	}: InputFeeProperties) => {
		const { t } = useTranslation();

		const viewType = properties.viewType ?? DEFAULT_VIEW_TYPE;
		const selectedFeeOption = properties.selectedFeeOption ?? DEFAULT_FEE_OPTION;

		const ticker = network.ticker();
		const exchangeTicker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency);
		const { convert } = useExchangeRate({ exchangeTicker, ticker });

		const showConvertedValues = network.isLive();

		const options: InputFeeOptions = {
			[InputFeeOption.Slow]: {
				displayValue: min,
				displayValueConverted: convert(min),
				label: t("TRANSACTION.FEES.SLOW"),
			},
			[InputFeeOption.Average]: {
				displayValue: avg,
				displayValueConverted: convert(avg),
				label: t("TRANSACTION.FEES.AVERAGE"),
			},
			[InputFeeOption.Fast]: {
				displayValue: max,
				displayValueConverted: convert(max),
				label: t("TRANSACTION.FEES.FAST"),
			},
		};

		const onChangeViewType = (newValue: InputFeeViewType) => {
			properties.onChangeViewType?.(newValue);

			if (newValue === InputFeeViewType.Simple) {
				onChangeGasPrice(options[selectedFeeOption].displayValue.toString());
				onChangeGasLimit(21_000);
			}
		};

		const onChangeOption = (newValue: InputFeeOption) => {
			properties.onChangeFeeOption?.(newValue);

			const feeValue = options[newValue].displayValue;
			onChangeGasPrice(feeValue?.toString());
		};

		const onChangeAdvancedGasPrice = (gasPrice: string) => {
			onChangeGasPrice(BigNumber.make(gasPrice).divide(1e9).toString());
		};

		const onChangeAdvancedGasLimit = (gasLimit: number) => {
			onChangeGasLimit(gasLimit);
		};

		const renderAdvanced = () => (
			<InputFeeAdvanced
				network={network}
				convert={convert}
				disabled={disabled || loading}
				exchangeTicker={exchangeTicker!}
				onChangeGasPrice={onChangeAdvancedGasPrice}
				onChangeGasLimit={onChangeAdvancedGasLimit}
				showConvertedValue={showConvertedValues}
				step={step}
				gasPrice={gasPrice}
				gasLimit={gasLimit}
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
						selectedOption={selectedFeeOption}
						onChange={onChangeOption}
					/>
				)}

				{viewType === InputFeeViewType.Advanced && renderAdvanced()}
			</div>
		);
	},
);

InputFee.displayName = "InputFee";
