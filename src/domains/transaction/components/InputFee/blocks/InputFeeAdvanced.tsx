import React, { useMemo } from "react";

import { InputFeeAdvancedAddon } from "./InputFeeAdvancedAddon";
import { useFormField } from "@/app/components/Form/useFormField";
import { InputCurrency } from "@/app/components/Input";
import { InputFeeAdvancedProperties } from "@/domains/transaction/components/InputFee/InputFee.contracts";
import { useStepMath } from "@/domains/transaction/components/InputFee/InputFee.helpers";
import { FormField, FormLabel } from "@/app/components/Form";
import { useTranslation } from "react-i18next";
import { Amount } from "@/app/components/Amount";
import { calculateGasFee, getFeeMinMax } from "@/domains/transaction/components/InputFee/InputFee";
import { BigNumber } from "@/app/lib/helpers";

const GAS_LIMIT_STEP = 1000;
const GAS_PRICE_STEP = 1;

export const InputFeeAdvanced: React.FC<InputFeeAdvancedProperties> = ({
	convert,
	disabled,
	exchangeTicker,
	onChangeGasPrice,
	onChangeGasLimit,
	showConvertedValue,
	gasPrice,
	gasLimit,
	network,
}: InputFeeAdvancedProperties) => {
	const { t } = useTranslation();

	const { decrement: decrementGasFee, increment: incrementGasFee } = useStepMath(GAS_PRICE_STEP, gasPrice.toString());

	const { decrement: decrementGasLimit, increment: incrementGasLimit } = useStepMath(GAS_LIMIT_STEP, gasLimit.toString());

	const { minGasPrice, maxGasPrice, minGasLimit, maxGasLimit } = getFeeMinMax();

	const formField = useFormField();
	const hasError = formField?.isInvalid;

	const handleGasPriceIncrement = () => {
		const incrementedValue= BigNumber.make(incrementGasFee());
		const value = incrementedValue.isGreaterThan(maxGasPrice) ? maxGasPrice: incrementedValue;
		onChangeGasPrice(BigNumber.make(value));
	};

	const handleGasPriceDecrement = () => {
		const decrementedValue = BigNumber.make(decrementGasFee());
		const value = decrementedValue.isLessThan(minGasPrice) ? minGasPrice : decrementedValue;
		onChangeGasPrice(value);
	};

	const handleGasLimitIncrement = () => {
		const incrementedValue= BigNumber.make(incrementGasLimit());
		const value = incrementedValue.isGreaterThan(maxGasLimit) ? maxGasLimit: incrementedValue;
		onChangeGasLimit(BigNumber.make(value));
	};

	const handleGasLimitDecrement = () => {
		const decrementedValue = BigNumber.make(decrementGasLimit());
		const value = decrementedValue.isLessThan(minGasLimit) ? minGasLimit : decrementedValue;
		onChangeGasLimit(value);
	};

	const gasFee = calculateGasFee(gasPrice, gasLimit);
	const convertedGasFee = useMemo(() => convert(+gasFee), [convert, gasFee]);

	const convertedGasPrice = useMemo(() => convert(+gasPrice), [convert, gasPrice]);

	return (
		<div className="border-theme-secondary-300 dark:border-theme-secondary-700 -mx-4 overflow-hidden rounded-xl border">
			<div className="space-y-4 p-4">
				<FormField name="gasPrice">
					<FormLabel
						id="fee"
						label={t("COMMON.GAS_PRICE_GWEI")}
						className="FormLabel text-theme-secondary-text hover:text-theme-primary-600! mb-2 flex text-sm leading-[17px] font-semibold transition-colors duration-100"
					/>

					<InputCurrency
						data-testid="Input_GasPrice"
						network={network}
						addons={{
							end: {
								content: (
									<InputFeeAdvancedAddon
										convertedValue={convertedGasPrice}
										disabled={!!disabled}
										exchangeTicker={network.ticker()}
										isDownDisabled={gasPrice.isLessThanOrEqualTo(minGasPrice)}
										onClickDown={handleGasPriceDecrement}
										onClickUp={handleGasPriceIncrement}
										showConvertedValue={showConvertedValue && gasPrice.isZero() && !hasError}
									/>
								),
								wrapperClassName: "divide-none",
							},
						}}
						disabled={disabled}
						onChange={onChangeGasPrice}
						value={gasPrice.toString()}
					/>
				</FormField>

				<FormField name="gasLimit">
					<FormLabel
						label={t("COMMON.GAS_LIMIT")}
						className="FormLabel text-theme-secondary-text hover:text-theme-primary-600! mb-2 flex text-sm leading-[17px] font-semibold transition-colors duration-100"
					/>

					<InputCurrency
						data-testid="Input_GasLimit"
						network={network}
						addons={{
							end: {
								content: (
									<InputFeeAdvancedAddon
										name="InputFeeAdvanced__gasLimit"
										disabled={!!disabled}
										isDownDisabled={gasLimit.isLessThanOrEqualTo(minGasLimit)}
										onClickDown={handleGasLimitDecrement}
										onClickUp={handleGasLimitIncrement}
										showConvertedValue={false}
										convertedValue={0}
										exchangeTicker=""
									/>
								),
								wrapperClassName: "divide-none",
							},
						}}
						disabled={disabled}
						onChange={onChangeGasLimit}
						value={gasLimit.toString()}
					/>
				</FormField>
			</div>
			<div className="bg-theme-secondary-200 text-theme-secondary-700 dark:bg-theme-dark-700 dark:text-theme-dark-200 flex flex-col space-y-2 px-4 py-3 text-xs leading-[15px] font-semibold sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:py-2">
				<div>
					<span>Max Fee </span>
					<Amount ticker={network.ticker()} value={gasFee} />
					{network.isLive() && (
						<span data-testid="InputFeeAdvanced__convertedGasFee">
							{" "}
							~<Amount ticker={exchangeTicker} value={convertedGasFee} />{" "}
						</span>
					)}
				</div>
				<div>
					<span>{t("COMMON.CONFIRMATION_TIME_LABEL")}</span>
					<span>
						{" "}
						{t("COMMON.CONFIRMATION_TIME", {
							time: 10,
						}).toString()}
					</span>
				</div>
			</div>
		</div>
	);
};
