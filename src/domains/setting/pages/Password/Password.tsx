import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
// import { Prompt } from "react-router-dom";

import { PasswordSettingsState } from "./Password.contracts";
import { Button } from "@/app/components/Button";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { Icon } from "@/app/components/Icon";
import { InputPassword } from "@/app/components/Input";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { toasts } from "@/app/services";
import { PasswordRemovalConfirmModal } from "@/domains/setting/components/PasswordRemovalConfirmModal";
import { SettingsWrapper } from "@/domains/setting/components/SettingsPageWrapper";
import { useSettingsPrompt } from "@/domains/setting/hooks/use-settings-prompt";
import { PasswordValidation } from "@/app/components/PasswordValidation";

export const PasswordSettings = () => {
	const activeProfile = useActiveProfile();
	const { persist } = useEnvironmentContext();

	const usesPassword = activeProfile.usesPassword();

	const [isConfirmRemovalVisible, setIsConfirmRemovalVisible] = useState(false);

	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const form = useForm<PasswordSettingsState>({
		defaultValues: {
			confirmPassword: "",
			currentPassword: "",
			password: "",
		},
		mode: "onChange",
	});

	const { formState, register, reset, watch } = form;
	const { confirmPassword, password } = watch();

	const { errors, isDirty, dirtyFields, isSubmitting, isValid } = formState;
	const { getPromptMessage: _a } = useSettingsPrompt({ dirtyFields, isDirty });

	const handleSubmit: SubmitHandler<PasswordSettingsState> = async ({ currentPassword, password }) => {
		try {
			if (usesPassword) {
				activeProfile.auth().changePassword(currentPassword, password);
			} else {
				activeProfile.auth().setPassword(password);
			}
		} catch {
			toasts.error(t("SETTINGS.PASSWORD.ERROR.MISMATCH"));
			return;
		}

		reset();

		// the profile has already been saved by the changePassword / setPassword methods above
		await persist();

		toasts.success(t("SETTINGS.PASSWORD.SUCCESS"));
	};

	const handleRemoval = async (currentPassword: string): Promise<void> => {
		try {
			activeProfile.auth().forgetPassword(currentPassword);

			setIsConfirmRemovalVisible(false);

			reset();

			await persist();

			toasts.success(t("SETTINGS.PASSWORD.REMOVAL.SUCCESS"));
		} catch {
			toasts.error(t("SETTINGS.PASSWORD.ERROR.MISMATCH"));
		}
	};

	const passwordStatus = usesPassword ? "CHANGE" : "CREATE";

	const isSubmitDisabled = () => {
		if ((password || confirmPassword) && !(password && confirmPassword)) {
			return true;
		}

		return !password || isSubmitting || !isValid || errors.validation;
	};

	const getRemoveButtonText = () => {
		/* istanbul ignore next -- @preserve */
		if (isXs) {
			return t("COMMON.REMOVE");
		}

		return t("SETTINGS.PASSWORD.BUTTON.REMOVE");
	};

	const getSubmitButtonText = () => {
		/* istanbul ignore next -- @preserve */
		if (isXs && passwordStatus === "CHANGE") {
			return t("COMMON.CHANGE");
		}

		return t(`SETTINGS.PASSWORD.BUTTON.${passwordStatus}`);
	};

	return (
		<>
			<SettingsWrapper profile={activeProfile} activeSettings="password">
				<Header
					title={t("SETTINGS.PASSWORD.TITLE")}
					subtitle={t(`SETTINGS.PASSWORD.SUBTITLE.${passwordStatus}`)}
				/>

				<Form id="password-settings__form" context={form} onSubmit={handleSubmit} className="mt-8">
					<div className="space-y-5">
						{usesPassword && (
							<FormField name="currentPassword">
								<FormLabel label={t("SETTINGS.PASSWORD.CURRENT")} />
								<InputPassword
									ref={register({
										required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
											field: t("SETTINGS.PASSWORD.CURRENT"),
										}).toString(),
									})}
									data-testid="Password-settings__input--currentPassword"
								/>
							</FormField>
						)}

						<PasswordValidation
							passwordField="password"
							passwordFieldLabel={t("SETTINGS.PASSWORD.PASSWORD_1")}
							confirmPasswordField="confirmPassword"
							confirmPasswordFieldLabel={t("SETTINGS.PASSWORD.PASSWORD_2")}
							currentPasswordField={usesPassword ? "currentPassword" : undefined}
							optional={false}
						/>
					</div>

					<FormButtons>
						{usesPassword && (
							<Button
								data-testid="Password-settings__remove-button"
								variant="danger"
								className="mr-auto flex w-full space-x-2 sm:w-auto"
								onClick={() => setIsConfirmRemovalVisible(true)}
							>
								<Icon name="Trash" />
								<span>{getRemoveButtonText()}</span>
							</Button>
						)}

						<Button
							data-testid="Password-settings__submit-button"
							disabled={isSubmitDisabled()}
							type="submit"
							className="w-full sm:w-auto"
						>
							{getSubmitButtonText()}
						</Button>
					</FormButtons>
				</Form>

				{/*<Prompt message={getPromptMessage} />*/}
			</SettingsWrapper>

			{isConfirmRemovalVisible && (
				<PasswordRemovalConfirmModal
					onCancel={() => setIsConfirmRemovalVisible(false)}
					onConfirm={handleRemoval}
				/>
			)}
		</>
	);
};
