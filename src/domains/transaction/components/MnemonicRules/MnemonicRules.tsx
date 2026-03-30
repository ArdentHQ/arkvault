import React, { useMemo } from "react";
import cn from "classnames";
import { Icon } from "@/app/components/Icon";
import { t } from "i18next";
import { twMerge } from "tailwind-merge";

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

export const MnemonicRules = ({ mnemonic, wrapperClass }: { mnemonic: string; wrapperClass?: string }) => {
	const result = useMemo(() => {
		const result = new Map<ValidationRule, boolean>();

		for (const [rule, validator] of Object.entries(validators)) {
			result.set(rule as ValidationRule, mnemonic ? validator(mnemonic) : false);
		}

		return result;
	}, [mnemonic]);

	return (
		<div
			className={twMerge(
				"bg-theme-secondary-100 dark:bg-theme-dark-950 dim:bg-theme-dim-950 border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 -mt-4.5 rounded-b border border-t-0 p-4",
				wrapperClass,
			)}
		>
			<Rules validationState={result} />
		</div>
	);
};

export const Rules = ({ validationState }: { validationState: Map<ValidationRule, boolean> }) => {
	const renderRule = (rule: ValidationRule, isValid: boolean) => (
		<div key={rule} data-testid={`MnemonicRule-${rule}-${+isValid}`} className="flex items-center space-x-2">
			<span
				className={cn(
					"text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-400 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
					{
						"bg-theme-primary-200 dark:bg-theme-dark-navy-950 dim:bg-theme-dim-navy-950": isValid,
						"border-theme-secondary-700 dark:border-theme-dark-500 dim:border-theme-dim-500 border-2":
							!isValid,
					},
				)}
			>
				{isValid && <Icon name="CheckmarkSmall" size="xs" />}
			</span>

			<span
				className={cn(
					"text-sm font-semibold",
					isValid
						? "text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600"
						: "text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200",
				)}
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
