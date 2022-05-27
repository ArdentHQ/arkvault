import { Helpers } from "@payvo/sdk-profiles";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ProfileFormState } from "./ProfileForm.contracts";
import { Button } from "@/app/components/Button";
import { ButtonGroup, ButtonGroupOption } from "@/app/components/ButtonGroup";
import { Divider } from "@/app/components/Divider";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { InputDefault } from "@/app/components/Input";
import { PasswordValidation } from "@/app/components/PasswordValidation";
import { Select } from "@/app/components/SelectDropdown";
import { SelectProfileImage } from "@/app/components/SelectProfileImage";
import { useTheme, useValidation } from "@/app/hooks";
import { useCurrencyOptions } from "@/app/hooks/use-currency-options";
import { DEFAULT_MARKET_PROVIDER } from "@/domains/profile/data";

export const ProfileForm = ({ defaultValues, onBack, onSubmit, shouldValidate, showPasswordFields }: any) => {
	const { t } = useTranslation();

	const currencyOptions = useCurrencyOptions(DEFAULT_MARKET_PROVIDER);

	const form = useForm<ProfileFormState>({
		defaultValues: {
			avatarImage: "",
			// @TODO:
			// The default value should be `false` but the disclaimer checkbox
			// was removed temporaly until the beta is over.
			// See related commit to rollback the checkbox once is needed again.
			// Consider tests and `disclaimer` rule inside
			// `src/domains/profile/validations/CreateProfile.ts` file
			disclaimer: true,
			name: "",
			...defaultValues,
		},
		mode: "onChange",
	});

	const { watch, register, formState, setValue, trigger } = form;
	const { errors, isSubmitting, isDirty, isValid } = formState;

	useEffect(() => {
		register("avatarImage");
		register("viewingMode", { required: true });
	}, [register]);

	const { avatarImage, confirmPassword, currency, name, password, viewingMode } = watch();

	const { resetTheme, setTheme } = useTheme();

	const { createProfile } = useValidation();

	const formattedName = name?.trim();

	const isSvg = useMemo(() => avatarImage.endsWith("</svg>"), [avatarImage]);

	useEffect(() => {
		if (shouldValidate) {
			trigger();
		}
	}, [shouldValidate, trigger]);

	useEffect(() => {
		if (!formattedName && isSvg) {
			setValue("avatarImage", "");
		}
	}, [formattedName, isSvg, setValue]);

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
			name: t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES.LIGHT"),
			value: "light",
		},
		{
			icon: "UnderlineMoon",
			name: t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES.DARK"),
			value: "dark",
		},
	];

	return (
		<div>
			<Form context={form} onSubmit={onSubmit} data-testid="ProfileForm__form">
				<div className="relative space-y-5">
					<div className="flex items-end justify-between">
						<div className="mr-6 w-full">
							<FormField name="name">
								<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.NAME")} />
								<InputDefault
									ref={register(createProfile.name())}
									onBlur={() => {
										/* istanbul ignore else */
										if (avatarImage.length === 0 || isSvg) {
											setValue("avatarImage", Helpers.Avatar.make(formattedName));
										}
									}}
								/>
							</FormField>
						</div>

						<SelectProfileImage
							value={avatarImage}
							name={formattedName}
							showLabel={false}
							onSelect={(image) => {
								if (!image) {
									setValue("avatarImage", formattedName ? Helpers.Avatar.make(formattedName) : "");
									return;
								}

								setValue("avatarImage", image);
							}}
						/>
					</div>

					{showPasswordFields && (
						<PasswordValidation
							passwordField="password"
							passwordFieldLabel={t("SETTINGS.GENERAL.PERSONAL.PASSWORD")}
							confirmPasswordField="confirmPassword"
							confirmPasswordFieldLabel={t("SETTINGS.GENERAL.PERSONAL.CONFIRM_PASSWORD")}
						/>
					)}

					<div className="flex pb-1 sm:pb-3">
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

						<div className="ml-4 border-l border-theme-secondary-300 pl-4 dark:border-theme-secondary-800">
							<FormField name="viewingMode">
								<FormLabel label={t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.TITLE")} />
								<ButtonGroup className="space-x-2">
									{viewingModes.map(({ icon, name, value }) => (
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
											variant="modern"
										>
											<div className="flex items-center space-x-2 px-1.5 sm:px-0.5">
												<Icon size="lg" name={icon} className="dark:text-theme-secondary-600" />
												<span className="hidden sm:inline-block">{name}</span>
											</div>
										</ButtonGroupOption>
									))}
								</ButtonGroup>
							</FormField>
						</div>
					</div>
				</div>

				<div className="hidden sm:block">
					<Divider />
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
