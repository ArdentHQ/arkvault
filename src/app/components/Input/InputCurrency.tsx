import { Currency } from "@payvo/sdk-intl";
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

const sanitize = (value?: string) => Currency.fromString(value || "").display;

export const InputCurrency = React.forwardRef<HTMLInputElement, InputCurrencyProperties>(
	({ onChange, value, ...properties }: InputCurrencyProperties, reference) => {
		const [amount, setAmount] = useState<string>(sanitize(value?.toString()));

		useEffect(() => {
			// when value is changed outside, update amount as well
			setAmount(sanitize(value?.toString()));
		}, [value]);

		const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
			const sanitizedValue = sanitize(event.target.value);

			setAmount(sanitizedValue);
			onChange?.(sanitizedValue);
		};

		return (
			<div className="relative">
				<Input
					data-testid="InputCurrency"
					onChange={handleInput}
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
