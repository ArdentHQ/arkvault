import { Currency } from "@ardenthq/sdk-intl";
import React, { useEffect, useState } from "react";

import { Input } from "./Input";

type InputCurrencyProperties = {
	addons?: any;
	onChange?: (value: any) => void;
	innerClassName?: string;
	ignoreContext?: boolean;
	errorMessage?: string;
	isInvalid?: boolean;
	isCompact?: boolean;
	noShadow?: boolean;
} & Omit<React.InputHTMLAttributes<any>, "onChange" | "defaultValue">;

const sanitize = (value?: string, magnitude?: number) => Currency.fromString(value || "", magnitude).display;

export const InputCurrency = React.forwardRef<HTMLInputElement, InputCurrencyProperties>(
	({ onChange, value, onBlur, ...properties }: InputCurrencyProperties, reference) => {
		const [amount, setAmount] = useState<string>(sanitize(value?.toString()));

		useEffect(() => {
			// when value is changed outside, update amount as well
			setAmount(sanitize(value?.toString(), 999));
		}, [value]);

		const parseValue = (value: string, limitLength = true) => {
			const sanitizedValue = sanitize(value, limitLength ? undefined : 999);

			setAmount(sanitizedValue);
			onChange?.(sanitizedValue);
		};

		const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
			parseValue(event.target.value, false);
		};

		const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
			parseValue(event.target.value);

			onBlur?.(event);
		};

		return (
			<div className="relative">
				<Input
					data-testid="InputCurrency"
					onChange={handleInput}
					onBlur={handleBlur}
					ref={reference}
					type="text"
					value={amount}
					{...properties}
				/>
			</div>
		);
	},
);

InputCurrency.displayName = "InputCurrency";
