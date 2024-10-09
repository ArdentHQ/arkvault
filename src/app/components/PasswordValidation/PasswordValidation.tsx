import cn from "classnames";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { t } from "i18next";
import { usePasswordValidation, ValidationState, ValidationRule } from "@/app/hooks/use-password-validation";
import { Icon } from "@/app/components/Icon";
import { FormField, FormLabel } from "@/app/components/Form";
import { InputPassword } from "@/app/components/Input";
import { useValidation } from "@/app/hooks";

interface RulesProperties {
	validationState: ValidationState;
}

const Rules: React.VFC<RulesProperties> = ({ validationState }) => {
	const renderRule = (rule: ValidationRule, isValid: boolean) => (
		<div key={rule} className="flex items-center space-x-2">
			<span
				className={cn(
					"flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-theme-primary-500",
					isValid ? "bg-theme-primary-200 dark:bg-theme-primary-900" : "border-2 border-theme-secondary-600",
				)}
			>
				{isValid && <Icon name="CheckmarkSmall" size="xs" />}
			</span>

			<span
				className={cn("text-sm font-semibold", isValid ? "text-theme-primary-600" : "text-theme-secondary-600")}
			>
				<>{t(`COMMON.VALIDATION.PASSWORD_RULES.${rule}`)}</>
			</span>
		</div>
	);

	return (
		<div data-testid="Rules" className="space-y-4">
			{[...validationState].map(([rule, isValid]) => renderRule(rule, isValid))}
		</div>
	);
};

interface PasswordValidationProperties {
	confirmPasswordField: string;
	confirmPasswordFieldLabel: string;
	currentPasswordField?: string;
	passwordField: string;
	passwordFieldLabel: string;
	optional?: boolean;
}

export const PasswordValidation: React.VFC<PasswordValidationProperties> = ({
	confirmPasswordField,
	confirmPasswordFieldLabel,
	currentPasswordField,
	passwordField,
	passwordFieldLabel,
	optional = true,
}) => {
	const [hasError, setHasError] = useState(false);
	const [showPasswordValidation, setShowPasswordValidation] = useState(false);

	const { password: passwordValidation } = useValidation();

	const { clearErrors, register, setError, setValue, trigger, watch } = useFormContext();
	const watchedValues = watch([passwordField, confirmPasswordField]);

	const password = watchedValues[passwordField];
	const confirmPassword = watchedValues[confirmPasswordField];

	let currentPassword;
	if (currentPasswordField) {
		currentPassword = watch(currentPasswordField);
	}

	const { resetValidationState, validatePassword, validationState } = usePasswordValidation(!!currentPasswordField);

	const handlePasswordChange = async (password: string) => {
		setValue(passwordField, password, {
			shouldDirty: true,
		});

		let isInvalid = false;

		if (password) {
			isInvalid = await validatePassword(password, currentPassword);
		} else {
			resetValidationState();
		}

		trigger(confirmPasswordField);

		setHasError(isInvalid);

		if (showPasswordValidation !== !!password) {
			setShowPasswordValidation(!!password);
		}
	};

	useEffect(() => {
		handlePasswordChange(password);
	}, [password]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!currentPassword && !password && !confirmPassword) {
			setShowPasswordValidation(false);
		}
	}, [currentPassword, password, confirmPassword]);

	useEffect(() => {
		const validate = async () => {
			await handlePasswordChange(password);
		};

		if (password) {
			validate();
		}
	}, [currentPassword]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (hasError) {
			setError("validation", { type: "manual" });
		} else {
			clearErrors("validation");
		}
	}, [clearErrors, hasError, setError]);

	return (
		<>
			<FormField name={passwordField}>
				<FormLabel label={passwordFieldLabel} optional={optional ? !password && !confirmPassword : false} />
				<InputPassword
					data-testid={`PasswordValidation__${passwordField}`}
					ref={register()}
					isInvalid={hasError}
				/>
			</FormField>

			{showPasswordValidation && <Rules validationState={validationState} />}

			<FormField name={confirmPasswordField}>
				<FormLabel
					label={confirmPasswordFieldLabel}
					optional={optional ? !password && !confirmPassword : false}
				/>
				<InputPassword
					data-testid={`PasswordValidation__${confirmPasswordField}`}
					ref={register(
						optional
							? passwordValidation.confirmOptionalPassword(password)
							: passwordValidation.confirmPassword(password),
					)}
				/>
			</FormField>
		</>
	);
};
