import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { PasswordSettingsState } from "./Password.contracts";
import { Button } from "@/app/components/Button";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { InputPassword } from "@/app/components/Input";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { toasts } from "@/app/services";
import { PasswordRemovalConfirmModal } from "@/domains/setting/components/PasswordRemovalConfirmModal";
import { SettingsWrapper } from "@/domains/setting/components/SettingsPageWrapper";
import { PasswordValidation } from "@/app/components/PasswordValidation";
import { SettingsButtonGroup, SettingsGroup } from "@/domains/setting/pages/General/General.blocks";
import { ListDivided } from "@/app/components/ListDivided";
import { Tooltip } from "@/app/components/Tooltip";
import { SettingsUnsavedChangesConfirmation } from "@/domains/setting/components/SettingsUnsavedChangesConfirmation";

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

	const getSubmitButtonText = () => {
		/* istanbul ignore next -- @preserve */
		if (isXs && passwordStatus === "CHANGE") {
			return t("COMMON.CHANGE");
		}

		return t(`SETTINGS.PASSWORD.BUTTON.${passwordStatus}`);
	};

	const items = [
		{
			itemValueClass: "w-full sm:w-auto",
			label: t("SETTINGS.PASSWORD.REMOVE_PASSWORD.TITLE"),
			labelDescription: t("SETTINGS.PASSWORD.REMOVE_PASSWORD.DESCRIPTION"),
			labelWrapperClass: "flex flex-col sm:flex-row justify-between items-center space-y-3",
			value: (
				<Tooltip disabled={usesPassword} content={t("SETTINGS.PASSWORD.REMOVE_PASSWORD.TOOLTIP")}>
					<div>
						<Button
							disabled={!usesPassword}
							data-testid="Password-settings__remove-button"
							variant="danger"
							className="bg-theme-danger-50 w-full sm:w-auto"
							onClick={() => setIsConfirmRemovalVisible(true)}
						>
							<Icon name="Trash" />
							<span className="whitespace-nowrap">{t("COMMON.REMOVE")}</span>
						</Button>
					</div>
				</Tooltip>
			),
		},
	];

	return (
		<>
			<SettingsWrapper profile={activeProfile} activeSettings="password">
				<Form id="password-settings__form" context={form} onSubmit={handleSubmit} className="space-y-0">
					<SettingsGroup title={t("SETTINGS.PASSWORD.TITLE")}>
						<div className="border-theme-secondary-300 dark:border-theme-secondary-800 mb-4 space-y-4 border-b border-dashed pb-6">
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

						<ListDivided items={items} />
					</SettingsGroup>

					<SettingsButtonGroup>
						<FormButtons className="border-none">
							<Button
								data-testid="Password-settings__submit-button"
								disabled={isSubmitDisabled()}
								type="submit"
								className="w-full sm:w-auto"
							>
								{getSubmitButtonText()}
							</Button>
						</FormButtons>
					</SettingsButtonGroup>
				</Form>

				<SettingsUnsavedChangesConfirmation isDirty={isDirty} dirtyFields={dirtyFields} />
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
