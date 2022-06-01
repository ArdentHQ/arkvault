import React, { useMemo } from "react";

import { InputFeeAdvancedAddon } from "./InputFeeAdvancedAddon";
import { useFormField } from "@/app/components/Form/useFormField";
import { InputCurrency } from "@/app/components/Input";
import { InputFeeAdvancedProperties } from "@/domains/transaction/components/InputFee/InputFee.contracts";
import { useStepMath } from "@/domains/transaction/components/InputFee/InputFee.helpers";

export const InputFeeAdvanced: React.FC<InputFeeAdvancedProperties> = ({
	convert,
	disabled,
	exchangeTicker,
	onChange,
	showConvertedValue,
	step,
	value,
}: InputFeeAdvancedProperties) => {
	const { decrement, increment } = useStepMath(step, +value);

	const formField = useFormField();
	const hasError = formField?.isInvalid;

	const isEmpty = value === "";
	const isZero = value === "0";

	const handleIncrement = () => {
		onChange(`${isEmpty ? step : increment()}`);
	};

	const handleDecrement = () => {
		if (isEmpty) {
			onChange("0");
			return;
		}

		const decrementedValue = decrement();

		if (decrementedValue <= 0) {
			onChange("0");
			return;
		}

		onChange(`${decrementedValue}`);
	};

	const convertedValue = useMemo(() => convert(+value), [convert, value]);

	return (
		<InputCurrency
			addons={{
				end: {
					content: (
						<InputFeeAdvancedAddon
							convertedValue={convertedValue}
							disabled={!!disabled}
							exchangeTicker={exchangeTicker}
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
	);
};
