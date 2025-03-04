import { Currency } from "@ardenthq/sdk-intl";
import React, { useEffect, useState, useCallback } from "react";

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
			const newValue = sanitize(value?.toString(), 999);
			setAmount((prev) => (prev !== newValue ? newValue : prev));
		}, [value]);

		const handleInput = useCallback(
			(event: React.ChangeEvent<HTMLInputElement>) => {
				const sanitizedValue = sanitize(event.target.value, 999);
				if (amount !== sanitizedValue) {
					setAmount(sanitizedValue);
					onChange?.(sanitizedValue);
				}
			},
			[amount, onChange],
		);

		const handleBlur = useCallback(
			(event: React.FocusEvent<HTMLInputElement>) => {
				const decimals = network?.toObject().currency.decimals ?? 18;
				const sanitizedValue = sanitize(event.target.value, decimals);
				if (amount !== sanitizedValue) {
					setAmount(sanitizedValue);
					onChange?.(sanitizedValue);
				}
				onBlur?.(event);
			},
			[amount, network, onChange, onBlur],
		);

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
