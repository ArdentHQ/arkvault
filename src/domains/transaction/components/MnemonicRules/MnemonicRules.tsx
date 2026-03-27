import { BIP39 } from "@ardenthq/arkvault-crypto";
import React, { useMemo } from "react";
import cn from "classnames";
import { Icon } from "@/app/components/Icon";
import { t } from "i18next";

enum ValidationRule {
	HasValidWordCount = "HAS_VALID_WORD_COUNT",
	LowerCase = "LOWERCASE",
	HasValidSpacing = "HAS_VALID_SPACING",
	NoTrailingSpace = "NO_TRAILING_SPACE",
}

const validators: Record<ValidationRule, Function> = {
	[ValidationRule.HasValidWordCount]: (value: string) => {
		const words = value.trim().split(" ");
		return words.length === 12 || words.length === 24;
	},
	[ValidationRule.LowerCase]: (value: string) => value === value.toLowerCase(),
	[ValidationRule.HasValidSpacing]: (value: string) => !/ {2,}/.test(value),
	[ValidationRule.NoTrailingSpace]: (value: string) => value === value.trim(),
};

export const MnemonicRules = ({ mnemonic }: { mnemonic: string }) => {

	const result = useMemo(() => {
		const result = new Map<ValidationRule, boolean>();

		for (const [rule, validator] of Object.entries(validators)) {
			result.set(rule as ValidationRule, mnemonic ? validator(mnemonic) : false);
		}

		return result;
	}, [mnemonic]);

	return (
		<div className="bg-theme-secondary-100 border-theme-secondary-300 -mt-4.5 rounded-b border-t-0 p-4">
			<Rules validationState={result} />
		</div>
	);
};

export const Rules = ({ validationState }: {validationState: Map<ValidationRule, boolean>}) => {
	const renderRule = (rule: ValidationRule, isValid: boolean) => (
		<div key={rule} className="flex items-center space-x-2">
			<span
				className={cn(
					"text-theme-primary-500 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
					isValid ? "bg-theme-primary-200 dark:bg-theme-primary-900" : "border-theme-secondary-600 border-2",
				)}
			>
				{isValid && <Icon name="CheckmarkSmall" size="xs" />}
			</span>

			<span
				className={cn("text-sm font-semibold", isValid ? "text-theme-primary-600" : "text-theme-secondary-600")}
			>
				<>{t(`COMMON.VALIDATION.MNEMONIC_RULES.${rule}`)}</>
			</span>
		</div>
	);

	return (
		<div data-testid="Rules" className="space-y-4">
			{[...validationState].map(([rule, isValid]) => renderRule(rule, isValid))}
		</div>
	);
};
