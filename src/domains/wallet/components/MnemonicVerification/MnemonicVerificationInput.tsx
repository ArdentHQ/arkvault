import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { getOrdinalIndicator } from "./utils/evaluateOrdinalIndicator";
import { FormField, FormLabel } from "@/app/components/Form";
import { Input } from "@/app/components/Input";

interface Properties {
	handleChange: (position: number, isValid: boolean) => void;
	answer: string;
	position: number;
	isValid: boolean;
}

export const MnemonicVerificationInput = ({ handleChange, answer, position, isValid }: Properties): JSX.Element => {
	const { t } = useTranslation();

	const [value, setValue] = useState("");

	const [updated, setUpdated] = useState(false);

	return (
		<FormField name="name" data-testid="MnemonicVerificationInput">
			<FormLabel
				label={t("WALLETS.MNEMONIC_VERIFICATION.WORD_NUMBER", {
					ordinalIndicator: getOrdinalIndicator(position),
					position: position,
				})}
			/>

			<Input
				data-testid="MnemonicVerificationInput__input"
				isValid={isValid}
				isInvalid={updated && !isValid}
				value={value}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					setValue(event.target.value);

					handleChange(position, event.target.value === answer);
				}}
				onBlur={() => {
					setUpdated(true);
				}}
			/>
		</FormField>
	);
};
