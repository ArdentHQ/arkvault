import {
	DEFAULT_FEE_OPTION,
	DEFAULT_VIEW_TYPE,
	InputFeeOption,
	InputFeeOptions,
	InputFeeProperties,
	InputFeeViewType,
} from "./InputFee.contracts";
import React, { memo } from "react";

import { BigNumber, get } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { InputFeeAdvanced } from "./blocks/InputFeeAdvanced";
import { InputFeeSimple } from "./blocks/InputFeeSimple";
import { Switch } from "@/app/components/Switch";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { useTranslation } from "react-i18next";
import { UnitConverter } from "@arkecosystem/typescript-crypto";
import { configManager } from "@/app/lib/mainsail";

export const calculateGasFee = (gasPrice?: BigNumber, gasLimit?: BigNumber): number => {
	if (!gasPrice || !gasLimit) {
		return 0;
	}

	return UnitConverter.formatUnits(gasLimit.times(gasPrice).toString(), "gwei");
};

export const getFeeMinMax = () => {
	const minGasPrice = BigNumber.make(
		UnitConverter.formatUnits(
			BigNumber.make(configManager.getMilestone()["gas"]["minimumGasPrice"] ?? 0).toString(),
			"gwei",
		),
	);

	const maxGasPrice = BigNumber.make(
		UnitConverter.formatUnits(
			BigNumber.make(configManager.getMilestone()["gas"]["maximumGasPrice"] ?? 0).toString(),
			"gwei",
		),
	);

	const minGasLimit = BigNumber.make(configManager.getMilestone()["gas"]["minimumGasLimit"] ?? 0);
	const maxGasLimit = BigNumber.make(configManager.getMilestone()["gas"]["maximumGasLimit"] ?? 0);

	return { maxGasLimit, maxGasPrice, minGasLimit, minGasPrice };
};

export const InputFee: React.FC<InputFeeProperties> = memo(
	({
		min,
		avg,
		max,
		disabled,
		network,
		profile,
		loading,
		onChangeGasPrice,
		estimatedGasLimit,
		onChangeGasLimit,
		gasPrice,
		gasLimit,
		...properties
	}: InputFeeProperties) => {
		const { t } = useTranslation();

		const viewType = properties.viewType ?? DEFAULT_VIEW_TYPE;
		const selectedFeeOption = properties.selectedFeeOption ?? DEFAULT_FEE_OPTION;

		const ticker = network.ticker();

		const blockTime = get(configManager.getMilestone(), "timeouts.blockTime")

		const exchangeTicker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency);
		const { convert } = useExchangeRate({ exchangeTicker, profile, ticker });

		const showConvertedValues = network.isLive();

		const options: InputFeeOptions = {
			[InputFeeOption.Slow]: {
				displayValue: calculateGasFee(min, gasLimit),
				displayValueConverted: convert(calculateGasFee(min, gasLimit)),
				gasPrice: min,
				label: t("TRANSACTION.FEES.SLOW"),
			},
			[InputFeeOption.Average]: {
				displayValue: calculateGasFee(avg, gasLimit),
				displayValueConverted: convert(calculateGasFee(avg, gasLimit)),
				gasPrice: avg,
				label: t("TRANSACTION.FEES.AVERAGE"),
			},
			[InputFeeOption.Fast]: {
				displayValue: calculateGasFee(max, gasLimit),
				displayValueConverted: convert(calculateGasFee(max, gasLimit)),
				gasPrice: max,
				label: t("TRANSACTION.FEES.FAST"),
			},
		};

		const onChangeViewType = (newValue: InputFeeViewType) => {
			properties.onChangeViewType?.(newValue);

			if (newValue === InputFeeViewType.Simple) {
				onChangeGasPrice(options[selectedFeeOption].gasPrice);
				onChangeGasLimit(estimatedGasLimit);
			}
		};

		const onChangeOption = (newValue: InputFeeOption) => {
			properties.onChangeFeeOption?.(newValue);
			onChangeGasPrice(options[newValue].gasPrice);
		};

		const renderAdvanced = () => (
			<InputFeeAdvanced
				blockTime={blockTime}
				network={network}
				convert={convert}
				disabled={disabled || loading}
				exchangeTicker={exchangeTicker!}
				onChangeGasPrice={(gasPrice: BigNumber | number | string) => {
					const value = gasPrice === "" ? 0 : gasPrice;
					onChangeGasPrice(BigNumber.make(value));
				}}
				onChangeGasLimit={(gasLimit: BigNumber | number | string) => {
					const value = gasLimit === "" ? 0 : gasLimit;
					onChangeGasLimit(BigNumber.make(value));
				}}
				showConvertedValue={showConvertedValues}
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
						blockTime={blockTime}
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
