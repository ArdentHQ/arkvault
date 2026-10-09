import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { RegisterOptions, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "./Input";
import { useFormField } from "@/app/components/Form/useFormField";
import { AddressService } from "@/app/lib/mainsail/address.service";

export type InputAddressProperties = {
	profile: Contracts.IProfile;
	coin?: string;
	network?: string;
	registerRef?: UseFormRegister<any>;
	additionalRules?: RegisterOptions;
	onValidAddress?: (address: string) => void;
	onChange?: (address: string) => void;
	useDefaultRules?: boolean;
} & React.InputHTMLAttributes<any>;

const defaultProps = {
	additionalRules: {},
};

export const InputAddress = ({
	registerRef,
	additionalRules = defaultProps.additionalRules,
	onValidAddress,
	useDefaultRules = true,
	onChange,
	...properties
}: InputAddressProperties) => {
	const { t } = useTranslation();
	const fieldContext = useFormField();

	const validateAddress = (address: string) => {
		const isValidAddress: boolean = new AddressService().validate(address);

		if (isValidAddress) {
			onValidAddress?.(address);
			return true;
		}

		return t("COMMON.INPUT_ADDRESS.VALIDATION.NOT_VALID");
	};

	const defaultRules = {
		...additionalRules,
		validate: {
			validateAddress,
			...additionalRules.validate,
		},
	};
	const rules = useDefaultRules ? defaultRules : additionalRules;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value);

	const registration =
		registerRef && fieldContext
			? registerRef(fieldContext.name, { ...rules, onChange: handleChange })
			: { onChange: handleChange };

	return (
		<Input
			{...registration}
			type="text"
			data-testid="InputAddress__input"
			autoComplete="off"
			{...properties}
		/>
	);
};
