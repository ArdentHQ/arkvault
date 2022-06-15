import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { RegisterOptions } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "./Input";

export type InputAddressProperties = {
	profile: Contracts.IProfile;
	coin?: string;
	network?: string;
	registerRef?: (options: RegisterOptions) => (reference: HTMLInputElement | null) => void;
	additionalRules?: RegisterOptions;
	onValidAddress?: (address: string) => void;
	onChange?: (address: string) => void;
	useDefaultRules?: boolean;
} & React.InputHTMLAttributes<any>;

const defaultProps = {
	additionalRules: {},
};

export const InputAddress = ({
	profile,
	coin,
	network,
	registerRef,
	additionalRules = defaultProps.additionalRules,
	onValidAddress,
	useDefaultRules = true,
	...properties
}: InputAddressProperties) => {
	const { t } = useTranslation();

	const validateAddress = async (address: string) => {
		const instance = profile.coins().set(coin!, network!);
		const isValidAddress: boolean = await instance.address().validate(address);

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
			...additionalRules?.validate,
		},
	};
	const rules = useDefaultRules ? defaultRules : {};

	return (
		<Input
			ref={registerRef?.(rules)}
			type="text"
			data-testid="InputAddress__input"
			{...properties}
			autoComplete="off"
		/>
	);
};
