import { pwned } from "@faustbrian/node-haveibeenpwned";
import { useState } from "react";

export enum ValidationRule {
	LowerCase = "LOWERCASE",
	UpperCase = "UPPERCASE",
	Number = "NUMBER",
	Symbol = "SYMBOL",
	Length = "LENGTH",
	Uncompromised = "UNCOMPROMISED",
	New = "NEW",
}

export type ValidationState = Map<ValidationRule, boolean>;

export const defaultState: ValidationState = new Map([
	[ValidationRule.LowerCase, false],
	[ValidationRule.UpperCase, false],
	[ValidationRule.Number, false],
	[ValidationRule.Symbol, false],
	[ValidationRule.Length, false],
	[ValidationRule.Uncompromised, false],
]);

const isInvalid = (state: ValidationState) => {
	const values = [...state.values()];
	return values.some((value) => !!value) && values.some((value) => !value);
};

export const usePasswordValidation = (usesPassword?: boolean) => {
	const [state, setState] = useState<ValidationState>(() => {
		const state = new Map(defaultState);

		if (usesPassword) {
			state.set(ValidationRule.New, false);
		}

		return state;
	});

	const validatePassword = async (password: string, currentPassword?: string): Promise<boolean> => {
		const newState: ValidationState = new Map([
			[ValidationRule.LowerCase, /\p{Ll}/u.test(password)],
			[ValidationRule.UpperCase, /\p{Lu}/u.test(password)],
			[ValidationRule.Number, /\p{N}/u.test(password)],
			[ValidationRule.Symbol, /\p{Z}|\p{S}|\p{P}/u.test(password)],
			[ValidationRule.Length, /^.{8,}$/.test(password)],
			[ValidationRule.Uncompromised, false],
		]);

		if (usesPassword) {
			newState.set(ValidationRule.New, password !== currentPassword);
		}

		try {
			const compromised = await pwned(password);
			newState.set(ValidationRule.Uncompromised, !compromised);
		} catch {
			newState.set(ValidationRule.Uncompromised, true);
		}

		setState(newState);

		return isInvalid(newState);
	};

	const resetValidationState = () => setState(new Map(defaultState));

	return {
		resetValidationState,
		validatePassword,
		validationState: state,
	};
};
