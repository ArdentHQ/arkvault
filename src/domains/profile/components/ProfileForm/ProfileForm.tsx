import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { ProfileFormState } from "./ProfileForm.contracts";
import { Button } from "@/app/components/Button";
import { ButtonGroup, ButtonGroupOption } from "@/app/components/ButtonGroup";
import { Divider } from "@/app/components/Divider";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { InputDefault } from "@/app/components/Input";
import { PasswordValidation } from "@/app/components/PasswordValidation";
import { Select } from "@/app/components/SelectDropdown";
import { useTheme, useValidation } from "@/app/hooks";
import { useCurrencyOptions } from "@/app/hooks/use-currency-options";
import { DEFAULT_MARKET_PROVIDER } from "@/domains/profile/data";
import { Checkbox } from "@/app/components/Checkbox";
import { Link } from "@/app/components/Link";

const PRIVACY_POLICY_URL = "https://arkvault.io/privacy-policy";
const TERMS_URL = "http://arkvault.io/terms-of-service";

export const ProfileForm = ({ defaultValues, onBack, onSubmit, shouldValidate, showPasswordFields }: any) => {
	const { t } = useTranslation();

	const currencyOptions = useCurrencyOptions(DEFAULT_MARKET_PROVIDER);

	const form = useForm<ProfileFormState>({
		defaultValues: {
			disclaimer: "",
			name: "",
			...defaultValues,
		},
		mode: "onChange",
	});

	const { watch, register, formState, setValue, trigger } = form;
	const { errors, isSubmitting, isDirty, isValid } = formState;

	useEffect(() => {
		register("viewingMode", { required: true });
	}, [register]);

	const { confirmPassword, currency, disclaimer, password, viewingMode } = watch();

	const { resetTheme, setTheme } = useTheme();

	const { createProfile } = useValidation();

	useEffect(() => {
		if (shouldValidate) {
			trigger();
		}
	}, [shouldValidate, trigger]);

	useEffect(() => {
		setTheme(viewingMode);
	}, [viewingMode]);

	const isSubmitDisabled = () => {
		if ((password || confirmPassword) && !(password && confirmPassword)) {
			return true;
		}

		return isSubmitting || (isDirty ? !isValid || !!errors.validation : true);
	};

	const viewingModes: any[] = [
		{
			icon: "UnderlineSun",
			label: t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES.LIGHT"),
			value: "light",
		},
		{
			icon: "UnderlineMoon",
			label: t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES.DARK"),
			value: "dark",
		},
		{
			icon: "Dim",
			label: t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES.DIM"),
			value: "dim",
		},
	];

	return (
		<div>
			<Form context={form} onSubmit={onSubmit} data-testid="ProfileForm__form">
				<div className="relative space-y-4">
					<div>
						<FormField name="name">
							<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.NAME")} />
							<InputDefault ref={register(createProfile.name())} />
						</FormField>
					</div>

					{showPasswordFields && (
						<PasswordValidation
							passwordField="password"
							passwordFieldLabel={t("SETTINGS.GENERAL.PERSONAL.PASSWORD")}
							confirmPasswordField="confirmPassword"
							confirmPasswordFieldLabel={t("SETTINGS.GENERAL.PERSONAL.CONFIRM_PASSWORD")}
						/>
					)}

					<div className="flex flex-col pb-1 sm:flex-row">
						<FormField className="flex flex-1 flex-col" name="currency">
							<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.CURRENCY")} />
							<Select
								id="ProfileForm__currency"
								defaultValue={currency}
								placeholder={t("COMMON.SELECT_OPTION", {
									option: t("SETTINGS.GENERAL.PERSONAL.CURRENCY"),
								})}
								ref={register(createProfile.currency())}
								options={currencyOptions}
								onChange={(currency: any) =>
									setValue("currency", currency?.value, {
										shouldDirty: true,
										shouldValidate: true,
									})
								}
								allowOverflow
							/>
						</FormField>

						<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 mt-4 sm:mt-0 sm:ml-4 sm:border-l sm:pl-4">
							<FormField name="viewingMode">
								<FormLabel label={t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.TITLE")} />
								<Select
									id="ProfileForm__viewingMode_select"
									defaultValue={viewingMode}
									placeholder={t("COMMON.SELECT_OPTION", {
										option: t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.TITLE"),
									})}
									options={viewingModes}
									onChange={(viewingMode: any) =>
										setValue("viewingMode", viewingMode?.value, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
									allowOverflow
									className="sm:hidden"
								/>
								<ButtonGroup className="hidden space-x-2 sm:flex">
									{viewingModes.map(({ icon, label, value }) => (
										<ButtonGroupOption
											key={value}
											isSelected={() => viewingMode === value}
											setSelectedValue={() =>
												form.setValue("viewingMode", value, {
													shouldDirty: true,
													shouldValidate: true,
												})
											}
											value={value}
											className="h-14"
										>
											<div className="flex items-center space-x-2 px-1.5 sm:px-0.5">
												<Icon size="lg" name={icon} className="dark:text-theme-secondary-600" />
												<span className="hidden sm:inline-block">{label}</span>
											</div>
										</ButtonGroupOption>
									))}
								</ButtonGroup>
							</FormField>
						</div>
					</div>
				</div>

				<Divider />

				<div className="mb-8 py-1">
					<FormField name="disclaimer">
						<label className="flex cursor-pointer items-center space-x-3">
							<Checkbox
								data-testid="ProfileForm__disclaimer-checkbox"
								name="disclaimer"
								ref={register(createProfile.disclaimer())}
								onChange={() =>
									setValue("disclaimer", !disclaimer, {
										shouldDirty: true,
										shouldValidate: true,
									})
								}
							/>
							<span className="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200 text-sm whitespace-pre-line">
								<Trans
									i18nKey="PROFILE.PAGE_CREATE_PROFILE.DISCLAIMER"
									components={{
										linkPrivacyPolicy: <Link to={PRIVACY_POLICY_URL} isExternal />,
										linkTerms: <Link to={TERMS_URL} isExternal />,
									}}
								/>
							</span>
						</label>
					</FormField>
				</div>

				<FormButtons>
					<Button
						data-testid="ProfileForm__back-button"
						variant="secondary"
						onClick={() => {
							onBack();
							// to prevent changing theme by component
							resetTheme();
						}}
					>
						{t("COMMON.BACK")}
					</Button>

					<Button disabled={isSubmitDisabled()} type="submit" data-testid="ProfileForm__submit-button">
						{t("COMMON.CREATE")}
					</Button>
				</FormButtons>
			</Form>
		</div>
	);
};
