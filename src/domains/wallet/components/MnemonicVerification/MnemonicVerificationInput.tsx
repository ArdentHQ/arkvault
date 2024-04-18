import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { getOrdinalIndicator } from "./utils/evaluateOrdinalIndicator";
import { FormField, FormLabel } from "@/app/components/Form";
import { Input } from "@/app/components/Input";
import { Icon } from "@/app/components/Icon";

interface Properties {
	handleChange: (position: number, isValid: boolean) => void;
	answer: string;
	position: number;
}

export const MnemonicVerificationInput = ({ handleChange, answer, position }: Properties): JSX.Element => {
	const { t } = useTranslation();

	const [value, setValue] = useState("");

	const isValid = value === answer;

	return (
		<FormField name="name">
			<FormLabel
				label={t("WALLETS.MNEMONIC_VERIFICATION.WORD_NUMBER", {
					ordinalIndicator: getOrdinalIndicator(position),
					position: position,
				})}
			/>

			<Input
				isValid={isValid}
				value={value}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					setValue(event.target.value);

					handleChange(position, event.target.value === answer);
				}}
				addons={
					isValid
						? {
								end: {
									content: (
										<Icon
											name="CircleCheckMark"
											size="lg"
											className="pointer-events-none text-theme-primary-600 focus:outline-none"
										/>
									),
								},
						  }
						: undefined
				}
			/>
		</FormField>
	);
};
