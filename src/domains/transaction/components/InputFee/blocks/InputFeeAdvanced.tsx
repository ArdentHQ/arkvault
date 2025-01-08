import React, { useMemo } from "react";

import { InputFeeAdvancedAddon } from "./InputFeeAdvancedAddon";
import { useFormField } from "@/app/components/Form/useFormField";
import { InputCurrency } from "@/app/components/Input";
import { InputFeeAdvancedProperties } from "@/domains/transaction/components/InputFee/InputFee.contracts";
import { useStepMath } from "@/domains/transaction/components/InputFee/InputFee.helpers";
import { FormField, FormLabel } from "@/app/components/Form";
import { useTranslation } from "react-i18next";
import { Amount } from "@/app/components/Amount";
import { BigNumber } from "@ardenthq/sdk-helpers";

const GAS_LIMIT_STEP = 1000;

export const InputFeeAdvanced: React.FC<InputFeeAdvancedProperties> = ({
	convert,
	disabled,
	exchangeTicker,
	onChangeGasPrice,
	onChangeGasLimit,
	showConvertedValue,
	defaultGasLimit,
	minGasPrice,
	step,
	gasPrice,
	gasLimit,
	network,
}: InputFeeAdvancedProperties) => {
	const { t } = useTranslation();

	const { decrement: decrementGasFee, increment: incrementGasFee } = useStepMath(step, gasPrice);

	const { decrement: decrementGasLimit, increment: incrementGasLimit } = useStepMath(GAS_LIMIT_STEP, gasLimit);

	const formField = useFormField();
	const hasError = formField?.isInvalid;

	const isZero = Number(gasPrice) === 0;

	const handleGasPriceIncrement = () => {
		onChangeGasPrice(Number(gasPrice) < minGasPrice ? minGasPrice : +incrementGasFee());
	};

	const handleGasPriceDecrement = () => {
		const decrementedValue = decrementGasFee();

		if (+decrementedValue <= minGasPrice) {
			onChangeGasPrice(minGasPrice);
			return;
		}

		onChangeGasPrice(+decrementedValue);
	};

	const handleGasLimitIncrement = () => {
		onChangeGasLimit(gasLimit < defaultGasLimit ? defaultGasLimit : +incrementGasLimit());
	};

	const handleGasLimitDecrement = () => {
		const decrementedValue = decrementGasLimit();

		if (+decrementedValue <= defaultGasLimit) {
			onChangeGasLimit(defaultGasLimit);
			return;
		}

		onChangeGasLimit(+decrementedValue);
	};

	const gasFee = BigNumber.make(gasPrice).times(BigNumber.make(gasLimit)).divide(1e9).toNumber();
	const convertedGasFee = useMemo(() => convert(+gasFee), [convert, gasFee]);

	const convertedGasPrice = useMemo(() => convert(+gasPrice), [convert, gasPrice]);

	return (
		<div className="-mx-4 overflow-hidden rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-700">
			<div className="space-y-4 p-4">
				<FormField name="gasPrice">
					<FormLabel
						id="fee"
						label={t("COMMON.GAS_FEE_GWEI")}
						className="FormLabel mb-2 flex text-sm font-semibold leading-[17px] text-theme-secondary-text transition-colors duration-100 hover:!text-theme-primary-600"
					/>

					<InputCurrency
						network={network}
						addons={{
							end: {
								content: (
									<InputFeeAdvancedAddon
										convertedValue={convertedGasPrice}
										disabled={!!disabled}
										exchangeTicker={network.ticker()}
										isDownDisabled={gasPrice <= minGasPrice}
										onClickDown={handleGasPriceDecrement}
										onClickUp={handleGasPriceIncrement}
										showConvertedValue={showConvertedValue && !isZero && !hasError}
									/>
								),
								wrapperClassName: "divide-none",
							},
						}}
						disabled={disabled}
						onChange={onChangeGasPrice}
						value={gasPrice}
					/>
				</FormField>

				<FormField name="gasLimit">
					<FormLabel
						label={t("COMMON.GAS_LIMIT")}
						className="FormLabel mb-2 flex text-sm font-semibold leading-[17px] text-theme-secondary-text transition-colors duration-100 hover:!text-theme-primary-600"
					/>

					<InputCurrency
						network={network}
						addons={{
							end: {
								content: (
									<InputFeeAdvancedAddon
										disabled={!!disabled}
										isDownDisabled={gasLimit <= defaultGasLimit}
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
						value={gasLimit}
					/>
				</FormField>
			</div>
			<div className="flex flex-col space-y-2 bg-theme-secondary-200 px-4 py-3 text-xs font-semibold leading-[15px] text-theme-secondary-700 dark:bg-theme-dark-700 dark:text-theme-dark-200 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:py-2">
				<div>
					<span>Max Fee </span>
					<Amount ticker={network.ticker()} value={gasFee}/>
					{network.isLive() &&
						<span>
							{" "}
							~<Amount ticker={exchangeTicker} value={convertedGasFee} />{" "}
						</span>
					}
				</div>
				<div>
					<span>{t("COMMON.CONFIRMATION_TIME_LABEL")}</span>
					<span>
						{" "}
						{t("COMMON.CONFIRMATION_TIME", {
							time: 20,
						}).toString()}
					</span>
				</div>
			</div>
		</div>
	);
};
