import { Currency } from "@ardenthq/sdk-intl";
import React, { useEffect, useState } from "react";

import { Input } from "./Input";
import { Networks } from "@ardenthq/sdk";

type InputCurrencyProperties = {
	addons?: any;
	onChange?: (value: any) => void;
	innerClassName?: string;
	ignoreContext?: boolean;
	errorMessage?: string;
	isInvalid?: boolean;
	isCompact?: boolean;
	noShadow?: boolean;
	network?: Networks.Network;
} & Omit<React.InputHTMLAttributes<any>, "onChange" | "defaultValue">;

const sanitize = (value?: string, magnitude?: number) => Currency.fromString(value || "", magnitude).display;

export const InputCurrency = React.forwardRef<HTMLInputElement, InputCurrencyProperties>(
	({ onChange, value, onBlur, network, ...properties }: InputCurrencyProperties, reference) => {
		const [amount, setAmount] = useState<string>(sanitize(value?.toString()));

		useEffect(() => {
			// when value is changed outside, update amount as well
			setAmount(sanitize(value?.toString(), 999));
		}, [value]);

		const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
			const sanitizedValue = sanitize(event.target.value, 999);

			setAmount(sanitizedValue);

			onChange?.(sanitizedValue);
		};

		const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
			const sanitizedValue = sanitize(event.target.value, network?.toObject().currency.decimals ?? 18);

			setAmount(sanitizedValue);

			if (value !== sanitizedValue) {
				onChange?.(sanitizedValue);
			}

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
