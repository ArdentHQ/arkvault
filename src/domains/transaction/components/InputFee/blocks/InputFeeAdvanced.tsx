import React, { useMemo, useState } from "react";

import { InputFeeAdvancedAddon } from "./InputFeeAdvancedAddon";
import { useFormField } from "@/app/components/Form/useFormField";
import { InputCurrency } from "@/app/components/Input";
import { InputFeeAdvancedProperties } from "@/domains/transaction/components/InputFee/InputFee.contracts";
import { useStepMath } from "@/domains/transaction/components/InputFee/InputFee.helpers";
import { FormField, FormLabel } from "@/app/components/Form";
import { useTranslation } from "react-i18next";
import { Amount } from "@/app/components/Amount";

export const InputFeeAdvanced: React.FC<InputFeeAdvancedProperties> = ({
	convert,
	disabled,
	exchangeTicker,
	onChange,
	showConvertedValue,
	step,
	value,
	network,
}: InputFeeAdvancedProperties) => {
	const { t } = useTranslation();
	const { decrement: decrementGasFee, increment: incrementGasFee } = useStepMath(step, value);

	const [gasLimit, setGasLimit] = useState<string>("21000");

	const { decrement: decrementGasLimit, increment: incrementGasLimit } = useStepMath(100, gasLimit);

	const formField = useFormField();
	const hasError = formField?.isInvalid;

	const isEmpty = value === "";
	const isZero = value === "0";

	const handleIncrement = () => {
		onChange(`${isEmpty ? step : incrementGasFee()}`);
	};

	const handleDecrement = () => {
		if (isEmpty) {
			onChange("0");
			return;
		}

		const decrementedValue = decrementGasFee();

		if (+decrementedValue <= 0) {
			onChange("0");
			return;
		}

		onChange(decrementedValue);
	};

	const convertedValue = useMemo(() => convert(+value), [convert, value]);

	return (
		<div className="-mx-4 overflow-hidden rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-700">
			<div className="space-y-4 p-4">
				<FormField name="gasFee">
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
										convertedValue={convertedValue}
										disabled={!!disabled}
										exchangeTicker={network.ticker()}
										isDownDisabled={isZero}
										onClickDown={handleDecrement}
										onClickUp={handleIncrement}
										showConvertedValue={showConvertedValue && !isEmpty && !isZero && !hasError}
									/>
								),
								wrapperClassName: "divide-none",
							},
						}}
						disabled={disabled}
						onChange={onChange}
						value={value}
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
										isDownDisabled={Number(gasLimit) <= 0}
										onClickDown={() => {
											setGasLimit(decrementGasLimit());
										}}
										onClickUp={() => {
											setGasLimit(incrementGasLimit());
										}}
										showConvertedValue={false}
										convertedValue={0}
										exchangeTicker=""
									/>
								),
								wrapperClassName: "divide-none",
							},
						}}
						disabled={disabled}
						// onChange={onChange}
						value={gasLimit}
					/>
				</FormField>
			</div>
			<div className="flex flex-col space-y-2 bg-theme-secondary-200 px-4 py-3 text-xs font-semibold leading-[15px] text-theme-secondary-700 dark:bg-theme-dark-700 dark:text-theme-dark-200 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:py-2">
				<div>
					<span>Max Fee </span>
					<Amount ticker={network.ticker()} value={0.001_05} />
					<span>
						{" "}
						~<Amount ticker={exchangeTicker} value={0.01} />{" "}
					</span>
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
