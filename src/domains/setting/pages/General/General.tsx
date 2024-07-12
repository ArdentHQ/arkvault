import { Contracts, Helpers } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { GeneralSettingsState, SettingsOption } from "./General.contracts";
import { Button } from "@/app/components/Button";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { Icon } from "@/app/components/Icon";
import { InputDefault } from "@/app/components/Input";
import { ListDivided } from "@/app/components/ListDivided";
import { Select } from "@/app/components/SelectDropdown";
import { SelectProfileImage } from "@/app/components/SelectProfileImage";
import { useEnvironmentContext } from "@/app/contexts";
import { useAccentColor, useActiveProfile, useBreakpoint, useProfileJobs, useTheme, useValidation } from "@/app/hooks";
import { useCurrencyOptions } from "@/app/hooks/use-currency-options";
import { toasts } from "@/app/services";
import { PlatformSdkChoices } from "@/data";
import { ResetProfile } from "@/domains/profile/components/ResetProfile";
import { SettingsWrapper } from "@/domains/setting/components/SettingsPageWrapper";
import { useSettingsPrompt } from "@/domains/setting/hooks/use-settings-prompt";
import { SettingsGroup } from "@/domains/setting/pages/General/General.blocks";

const requiredFieldMessage = "COMMON.VALIDATION.FIELD_REQUIRED";
const selectOption = "COMMON.SELECT_OPTION";

export const GeneralSettings: React.FC = () => {
	const profile = useActiveProfile();

	const isProfileRestored = profile.status().isRestored();

	const { isXs } = useBreakpoint();

	const { persist } = useEnvironmentContext();
	const { syncExchangeRates } = useProfileJobs(profile);

	const { resetProfileTheme } = useTheme();
	const { resetAccentColor } = useAccentColor();

	const { t } = useTranslation();

	const getDefaultValues = (): Partial<GeneralSettingsState> => {
		const settings = profile.settings();

		/* istanbul ignore next -- @preserve */
		const name = profile.settings().get<string>(Contracts.ProfileSetting.Name) || "";

		return {
			automaticSignOutPeriod: settings.get<number>(Contracts.ProfileSetting.AutomaticSignOutPeriod)?.toString(),
			avatar: settings.get(Contracts.ProfileSetting.Avatar) || Helpers.Avatar.make(name),
			bip39Locale: settings.get(Contracts.ProfileSetting.Bip39Locale),
			exchangeCurrency: settings.get(Contracts.ProfileSetting.ExchangeCurrency),
			locale: settings.get(Contracts.ProfileSetting.Locale),
			marketProvider: settings.get(Contracts.ProfileSetting.MarketProvider),
			name,
			timeFormat: settings.get(Contracts.ProfileSetting.TimeFormat),
		};
	};

	const form = useForm<GeneralSettingsState>({
		defaultValues: getDefaultValues(),
		mode: "onChange",
		shouldUnregister: false,
	});

	const { register, watch, formState, setValue, reset } = form;
	const { isValid, isSubmitting, isDirty, dirtyFields } = formState;

	const { name, avatar, marketProvider, exchangeCurrency } = watch();

	const currencyOptions = useCurrencyOptions(marketProvider);

	useEffect(() => {
		const initializeForm = () => {
			if (isProfileRestored) {
				reset(getDefaultValues());
			}
		};

		initializeForm();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isProfileRestored]);

	useEffect(() => {
		register("avatar");
	}, [register]);

	const formattedName = name.trim();

	const hasDefaultAvatar = !!avatar.endsWith("</svg>");

	const { settings: settingsValidation } = useValidation();
	const { getPromptMessage: _ } = useSettingsPrompt({ dirtyFields, isDirty });

	const [isResetProfileOpen, setIsResetProfileOpen] = useState(false);

	useEffect(() => {
		const clearAvatarWhenNameIsEmpty = () => {
			if (formattedName === "" && hasDefaultAvatar) {
				setValue("avatar", "");
			}
		};

		clearAvatarWhenNameIsEmpty();
	}, [formattedName, hasDefaultAvatar, setValue]);

	const handleOnReset = () => {
		setIsResetProfileOpen(false);

		reset(getDefaultValues());

		resetProfileTheme(profile);
		resetAccentColor();

		window.scrollTo({ behavior: "smooth", top: 0 });
	};

	const securityItems = [
		{
			content: (
				<FormField name="automaticSignOutPeriod" data-testid="General-settings__auto-signout">
					<FormLabel label={t("SETTINGS.GENERAL.SECURITY.AUTOMATIC_SIGN_OUT_PERIOD.TITLE")} />
					<Select
						id="select-auto-signout"
						placeholder={t(selectOption, {
							option: t("SETTINGS.GENERAL.SECURITY.AUTOMATIC_SIGN_OUT_PERIOD.TITLE"),
						})}
						ref={register({
							required: t(requiredFieldMessage, {
								field: t("SETTINGS.GENERAL.SECURITY.AUTOMATIC_SIGN_OUT_PERIOD.TITLE"),
							}).toString(),
						})}
						options={[1, 5, 10, 15, 30, 60].map((count) => ({
							label: t("COMMON.DATETIME.MINUTES", { count }),
							value: `${count}`,
						}))}
						onChange={(signOutPeriod: SettingsOption) => {
							setValue("automaticSignOutPeriod", signOutPeriod?.value, {
								shouldDirty: true,
								shouldValidate: true,
							});
						}}
						defaultValue={`${getDefaultValues().automaticSignOutPeriod}`}
					/>
				</FormField>
			),
		},
	];

	const otherItems = [
		{
			itemValueClass: "w-full sm:w-auto",
			label: t("SETTINGS.GENERAL.OTHER.RESET_SETTINGS.TITLE"),
			labelDescription: t("SETTINGS.GENERAL.OTHER.RESET_SETTINGS.DESCRIPTION"),
			labelWrapperClass: "flex flex-col sm:flex-row space-y-3 justify-between items-center",
			value: (
				<Button onClick={() => setIsResetProfileOpen(true)} variant="danger" className="w-full sm:w-auto">
					<Icon name="ArrowRotateLeft" />
					<span className="whitespace-nowrap">{t("COMMON.RESET")}</span>
				</Button>
			),
			wrapperClass: "pt-6 sm:pb-6",
		},
	];

	const handleSubmit = async ({
		automaticSignOutPeriod,
		avatar,
		bip39Locale,
		exchangeCurrency,
		locale,
		marketProvider,
		name,
		timeFormat,
	}: GeneralSettingsState) => {
		profile.settings().set(Contracts.ProfileSetting.AutomaticSignOutPeriod, automaticSignOutPeriod);
		profile.settings().set(Contracts.ProfileSetting.Bip39Locale, bip39Locale);
		profile.settings().set(Contracts.ProfileSetting.ExchangeCurrency, exchangeCurrency);
		profile.settings().set(Contracts.ProfileSetting.Locale, locale);
		profile.settings().set(Contracts.ProfileSetting.MarketProvider, marketProvider);
		profile.settings().set(Contracts.ProfileSetting.Name, name);
		profile.settings().set(Contracts.ProfileSetting.TimeFormat, timeFormat);
		profile.settings().set(Contracts.ProfileSetting.Avatar, avatar);

		await syncExchangeRates();

		await persist();

		reset(getDefaultValues());

		toasts.success(t("SETTINGS.GENERAL.SUCCESS"));
		window.scrollTo({ behavior: "smooth", top: 0 });
	};

	const isSaveButtonDisabled = isSubmitting || !isProfileRestored || (isDirty ? !isValid : true);

	return (
		<SettingsWrapper profile={profile} activeSettings="general">
			<Header title={t("SETTINGS.GENERAL.TITLE")} subtitle={t("SETTINGS.GENERAL.SUBTITLE")} />

			<Form data-testid="General-settings__form" context={form} onSubmit={handleSubmit} className="mt-8">
				<div className="relative mt-8">
					<h2 className="mb-3 text-lg">{t("SETTINGS.GENERAL.PERSONAL.TITLE")}</h2>

					<SelectProfileImage
						value={avatar}
						name={formattedName}
						onSelect={(value) => {
							if (!value) {
								setValue("avatar", Helpers.Avatar.make(formattedName), {
									shouldDirty: true,
									shouldValidate: true,
								});
								return;
							}

							setValue("avatar", value, {
								shouldDirty: true,
								shouldValidate: true,
							});
						}}
					/>

					<div className="mt-8 flex w-full flex-col justify-between sm:flex-row">
						<div className="flex flex-col sm:w-2/4">
							<FormField name="name">
								<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.NAME")} />
								<InputDefault
									ref={register(settingsValidation.name(profile.id()))}
									defaultValue={getDefaultValues().name}
									onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
										if (!avatar || hasDefaultAvatar) {
											const nameValue = event.target.value.trim();
											setValue("avatar", nameValue ? Helpers.Avatar.make(nameValue) : "");
										}
									}}
									data-testid="General-settings__input--name"
								/>
							</FormField>

							<FormField className="mt-8" name="bip39Locale">
								<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.PASSPHRASE_LANGUAGE")} />
								<Select
									id="select-passphrase-language"
									placeholder={t(selectOption, {
										option: t("SETTINGS.GENERAL.PERSONAL.PASSPHRASE_LANGUAGE"),
									})}
									ref={register({
										required: t(requiredFieldMessage, {
											field: t("SETTINGS.GENERAL.PERSONAL.PASSPHRASE_LANGUAGE"),
										}).toString(),
									})}
									onChange={(bip39Locale: SettingsOption) =>
										setValue("bip39Locale", bip39Locale?.value, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
									options={PlatformSdkChoices.passphraseLanguages}
									defaultValue={getDefaultValues().bip39Locale}
								/>
							</FormField>

							<FormField className="mt-8" name="exchangeCurrency">
								<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.CURRENCY")} />
								<Select
									id="select-currency"
									placeholder={t(selectOption, {
										option: t("SETTINGS.GENERAL.PERSONAL.CURRENCY"),
									})}
									ref={register({
										required: t(requiredFieldMessage, {
											field: t("SETTINGS.GENERAL.PERSONAL.CURRENCY"),
										}).toString(),
									})}
									options={currencyOptions}
									defaultValue={exchangeCurrency}
									onChange={(exchangeCurrency: SettingsOption) =>
										setValue("exchangeCurrency", exchangeCurrency?.value, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
								/>
							</FormField>
						</div>

						<div className="mt-8 flex flex-col sm:ml-5 sm:mt-0 sm:w-2/4">
							<FormField name="locale">
								<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.LANGUAGE")} />
								<Select
									id="select-language"
									placeholder={t(selectOption, {
										option: t("SETTINGS.GENERAL.PERSONAL.LANGUAGE"),
									})}
									ref={register({
										required: t(requiredFieldMessage, {
											field: t("SETTINGS.GENERAL.PERSONAL.LANGUAGE"),
										}).toString(),
									})}
									options={PlatformSdkChoices.languages}
									defaultValue={getDefaultValues().locale}
									onChange={(locale: SettingsOption) =>
										setValue("locale", locale?.value, { shouldDirty: true, shouldValidate: true })
									}
								/>
							</FormField>

							<FormField className="mt-8" name="marketProvider">
								<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.MARKET_PROVIDER")} />
								<Select
									id="select-market-provider"
									placeholder={t(selectOption, {
										option: t("SETTINGS.GENERAL.PERSONAL.MARKET_PROVIDER"),
									})}
									ref={register({
										required: t(requiredFieldMessage, {
											field: t("SETTINGS.GENERAL.PERSONAL.MARKET_PROVIDER"),
										}).toString(),
									})}
									options={PlatformSdkChoices.marketProviders}
									defaultValue={marketProvider}
									onChange={(marketProvider: SettingsOption) => {
										if (marketProvider?.unsupportedCurrencies?.includes(exchangeCurrency)) {
											toasts.warning(
												t("SETTINGS.GENERAL.UNSUPPORTED_CURRENCY", {
													currency: exchangeCurrency,
													provider: marketProvider.label,
												}),
											);

											setValue("exchangeCurrency", "USD", {
												shouldDirty: true,
												shouldValidate: true,
											});
										}

										setValue("marketProvider", marketProvider?.value, {
											shouldDirty: true,
											shouldValidate: true,
										});
									}}
								/>
							</FormField>

							<FormField className="mt-8" name="timeFormat">
								<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.TIME_FORMAT")} />
								<Select
									id="select-time-format"
									placeholder={t(selectOption, {
										option: t("SETTINGS.GENERAL.PERSONAL.TIME_FORMAT"),
									})}
									ref={register({
										required: t(requiredFieldMessage, {
											field: t("SETTINGS.GENERAL.PERSONAL.TIME_FORMAT"),
										}).toString(),
									})}
									options={PlatformSdkChoices.timeFormats}
									defaultValue={getDefaultValues().timeFormat}
									onChange={(timeFormat: SettingsOption) =>
										setValue("timeFormat", timeFormat?.value, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
								/>
							</FormField>
						</div>
					</div>
				</div>

				<SettingsGroup>
					<h2 className="mb-3 text-lg">{t("SETTINGS.GENERAL.SECURITY.TITLE")}</h2>
					<ListDivided items={securityItems} />
				</SettingsGroup>

				<SettingsGroup>
					<h2 className="mb-3 text-lg">{t("SETTINGS.GENERAL.OTHER.TITLE")}</h2>
					<ListDivided items={otherItems} noBorder={isXs} />
				</SettingsGroup>

				<FormButtons>
					<Button disabled={isSaveButtonDisabled} type="submit" data-testid="General-settings__submit-button">
						{t("COMMON.SAVE")}
					</Button>
				</FormButtons>
			</Form>

			<ResetProfile
				isOpen={isResetProfileOpen}
				profile={profile}
				onCancel={() => setIsResetProfileOpen(false)}
				onClose={() => setIsResetProfileOpen(false)}
				onReset={handleOnReset}
			/>

			{/*<Prompt message={getPromptMessage} />*/}
		</SettingsWrapper>
	);
};
