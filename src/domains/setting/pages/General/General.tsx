import { Contracts, Helpers } from "@/app/lib/profiles";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Prompt } from "react-router-dom";

import { GeneralSettingsState, SettingsOption } from "./General.contracts";
import { Button } from "@/app/components/Button";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { InputDefault } from "@/app/components/Input";
import { ListDivided } from "@/app/components/ListDivided";
import { Select } from "@/app/components/SelectDropdown";
import { SelectProfileImage } from "@/app/components/SelectProfileImage";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useProfileJobs, useTheme, useValidation, ViewingModeType } from "@/app/hooks";
import { useCurrencyOptions } from "@/app/hooks/use-currency-options";
import { toasts } from "@/app/services";
import { PlatformSdkChoices } from "@/data";
import { ResetProfile } from "@/domains/profile/components/ResetProfile";
import { SettingsWrapper } from "@/domains/setting/components/SettingsPageWrapper";
import { useSettingsPrompt } from "@/domains/setting/hooks/use-settings-prompt";
import { SettingsButtonGroup, SettingsGroup, ViewingMode } from "@/domains/setting/pages/General/General.blocks";
import { useZendesk } from "@/app/contexts/Zendesk";
import { Toggle } from "@/app/components/Toggle";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { Image } from "@/app/components/Image";

const requiredFieldMessage = "COMMON.VALIDATION.FIELD_REQUIRED";
const selectOption = "COMMON.SELECT_OPTION";

export const GeneralSettings: React.FC = () => {
	const profile = useActiveProfile();
	const { setProfileTheme } = useTheme();
	const { resetToDefaults } = useActiveNetwork({ profile });

	const isProfileRestored = profile.status().isRestored();

	const { persist } = useEnvironmentContext();
	const { syncExchangeRates } = useProfileJobs(profile);

	const { hideSupportChat, showSupportChat, isSupportChatOpen } = useZendesk();

	const { resetProfileTheme } = useTheme();

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
			showDevelopmentNetwork: settings.get(Contracts.ProfileSetting.UseTestNetworks),
			timeFormat: settings.get(Contracts.ProfileSetting.TimeFormat),
			useNetworkWalletNames: profile.appearance().get("useNetworkWalletNames"),
			viewingMode: profile.appearance().get("theme") as ViewingModeType,
		};
	};

	const form = useForm<GeneralSettingsState>({
		defaultValues: getDefaultValues(),
		mode: "onChange",
		shouldUnregister: false,
	});

	const { register, watch, formState, setValue, reset } = form;
	const { isValid, isSubmitting, isDirty, dirtyFields } = formState;

	const {
		name,
		avatar,
		marketProvider,
		exchangeCurrency,
		viewingMode,
		useNetworkWalletNames,
		showDevelopmentNetwork,
	} = watch();

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
		register("viewingMode");
		register("useNetworkWalletNames");
		register("showDevelopmentNetwork");
	}, [register]);

	const formattedName = name.trim();
	const hasDefaultAvatar = !!avatar.endsWith("</svg>");

	const { settings: settingsValidation } = useValidation();
	const { getPromptMessage } = useSettingsPrompt({ dirtyFields, isDirty });

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
						onChange={(signOutPeriod: SettingsOption | null) => {
							if (signOutPeriod) {
								setValue("automaticSignOutPeriod", signOutPeriod.value, {
									shouldDirty: true,
									shouldValidate: true,
								});
							} else {
								setValue("automaticSignOutPeriod", "", { shouldDirty: true, shouldValidate: true });
							}
						}}
						defaultValue={`${getDefaultValues().automaticSignOutPeriod}`}
					/>
				</FormField>
			),
		},
	];

	const appearenceItems = [
		{
			itemValueClass: "ml-5",
			label: `${t("SETTINGS.GENERAL.OTHER.VIEWING_MODE.TITLE")}`,
			labelDescription: `${t("SETTINGS.GENERAL.OTHER.VIEWING_MODE.DESCRIPTION")}`,
			value: (
				<ViewingMode
					viewingMode={viewingMode}
					onChange={(value) => {
						setValue("viewingMode", value, {
							shouldDirty: true,
							shouldValidate: true,
						});
					}}
				/>
			),
		},
		{
			label: t("SETTINGS.GENERAL.OTHER.ADDRESS_NAMING.TITLE"),
			labelAddon: (
				<Toggle
					name="useNetworkWalletNames"
					defaultChecked={useNetworkWalletNames}
					data-testid="AppearanceToggle__toggle-useNetworkWalletNames"
					onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
						setValue("useNetworkWalletNames", event.target.checked, {
							shouldDirty: true,
							shouldValidate: true,
						})
					}
				/>
			),
			labelDescription: t("SETTINGS.GENERAL.OTHER.ADDRESS_NAMING.DESCRIPTION"),
		},
	];

	const otherItems = [
		{
			label: t("SETTINGS.GENERAL.OTHER.SHOW_DEVELOPMENT_NETWORK.TITLE"),
			labelAddon: (
				<Toggle
					name="showDevelopmentNetwork"
					defaultChecked={showDevelopmentNetwork}
					data-testid="AppearanceToggle__toggle-showDevelopmentNetwork"
					onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
						setValue("showDevelopmentNetwork", event.target.checked, {
							shouldDirty: true,
							shouldValidate: true,
						})
					}
				/>
			),
			labelDescription: t("SETTINGS.GENERAL.OTHER.SHOW_DEVELOPMENT_NETWORK.DESCRIPTION"),
		},
		{
			itemValueClass: "w-full sm:w-auto",
			label: t("SETTINGS.GENERAL.OTHER.RESET_SETTINGS.TITLE"),
			labelDescription: t("SETTINGS.GENERAL.OTHER.RESET_SETTINGS.DESCRIPTION"),
			labelWrapperClass: "flex flex-col sm:flex-row space-y-3 justify-between items-center",
			value: (
				<Button
					onClick={() => setIsResetProfileOpen(true)}
					variant="danger"
					className="bg-theme-danger-50 w-full sm:w-auto"
				>
					<Icon name="ArrowRotateLeft" />
					<span className="whitespace-nowrap">{t("COMMON.RESET")}</span>
				</Button>
			),
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
		viewingMode,
		useNetworkWalletNames,
		showDevelopmentNetwork,
	}: GeneralSettingsState) => {
		profile.settings().set(Contracts.ProfileSetting.AutomaticSignOutPeriod, automaticSignOutPeriod);
		profile.settings().set(Contracts.ProfileSetting.Bip39Locale, bip39Locale);
		profile.settings().set(Contracts.ProfileSetting.ExchangeCurrency, exchangeCurrency);
		profile.settings().set(Contracts.ProfileSetting.Locale, locale);
		profile.settings().set(Contracts.ProfileSetting.MarketProvider, marketProvider);
		profile.settings().set(Contracts.ProfileSetting.Name, name);
		profile.settings().set(Contracts.ProfileSetting.TimeFormat, timeFormat);
		profile.settings().set(Contracts.ProfileSetting.Avatar, avatar);
		profile.settings().set(Contracts.ProfileSetting.Theme, viewingMode);
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, useNetworkWalletNames);
		profile.settings().set(Contracts.ProfileSetting.UseTestNetworks, showDevelopmentNetwork);

		const isChatOpen = isSupportChatOpen();

		hideSupportChat();
		setProfileTheme(profile);

		await syncExchangeRates();

		await persist();

		if (isChatOpen) {
			showSupportChat(profile);
		}

		if (!showDevelopmentNetwork) {
			await resetToDefaults();
		}

		reset(getDefaultValues());

		toasts.success(t("SETTINGS.GENERAL.SUCCESS"));
		window.scrollTo({ behavior: "smooth", top: 0 });
	};

	const isSaveButtonDisabled = isSubmitting || !isProfileRestored || (isDirty ? !isValid : true);

	return (
		<SettingsWrapper profile={profile} activeSettings="general">
			<Form data-testid="General-settings__form" context={form} onSubmit={handleSubmit} className="space-y-0">
				<SettingsGroup title={t("SETTINGS.GENERAL.PERSONAL.TITLE")}>
					<div className="group space-y-2">
						<span className="text-theme-secondary-text group-hover:text-theme-primary-600 cursor-default text-sm font-semibold transition-colors duration-100">
							{t("SETTINGS.GENERAL.PERSONAL.PROFILE_IMAGE")}
						</span>

						<div className="relative flex flex-row sm:space-x-3">
							<div className="bg-theme-primary-50 dark:bg-theme-dark-950 dim:bg-theme-dim-950 hidden h-[92px] min-w-[226px] items-center justify-center rounded-lg px-4 sm:flex">
								<Image className="hidden lg:block" name="ProfileImageExample" />
								<Image className="lg:hidden" name="ProfileImageExampleResponsive" />
							</div>

							<SelectProfileImage
								value={avatar}
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
						</div>
					</div>

					<div className="mt-5 flex w-full flex-col justify-between sm:flex-row">
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

							<FormField className="mt-5" name="bip39Locale">
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
									onChange={(bip39Locale: SettingsOption | null) => {
										if (bip39Locale) {
											setValue("bip39Locale", bip39Locale.value, {
												shouldDirty: true,
												shouldValidate: true,
											});
										} else {
											setValue("bip39Locale", "", { shouldDirty: true, shouldValidate: true });
										}
									}}
									options={PlatformSdkChoices.passphraseLanguages}
									defaultValue={getDefaultValues().bip39Locale}
								/>
							</FormField>

							<FormField className="mt-5" name="exchangeCurrency">
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
									onChange={(exchangeCurrency: SettingsOption) => {
										if (exchangeCurrency) {
											setValue("exchangeCurrency", exchangeCurrency.value, {
												shouldDirty: true,
												shouldValidate: true,
											});
										} else {
											setValue("exchangeCurrency", "", {
												shouldDirty: true,
												shouldValidate: true,
											});
										}
									}}
								/>
							</FormField>
						</div>

						<div className="mt-5 flex flex-col sm:mt-0 sm:ml-5 sm:w-2/4">
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
									onChange={(locale: SettingsOption) => {
										if (locale) {
											setValue("locale", locale.value, {
												shouldDirty: true,
												shouldValidate: true,
											});
										} else {
											setValue("locale", "", { shouldDirty: true, shouldValidate: true });
										}
									}}
								/>
							</FormField>

							<FormField className="mt-5" name="marketProvider">
								<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.PRICE_SOURCE")} />
								<Select
									id="select-market-provider"
									placeholder={t(selectOption, {
										option: t("SETTINGS.GENERAL.PERSONAL.PRICE_SOURCE"),
									})}
									ref={register({
										required: t(requiredFieldMessage, {
											field: t("SETTINGS.GENERAL.PERSONAL.PRICE_SOURCE"),
										}).toString(),
									})}
									options={PlatformSdkChoices.marketProviders}
									defaultValue={marketProvider}
									onChange={(selectedMarketProvider: SettingsOption | null) => {
										if (!selectedMarketProvider) {
											return;
										}
										if (selectedMarketProvider.unsupportedCurrencies?.includes(exchangeCurrency)) {
											toasts.warning(
												t("SETTINGS.GENERAL.UNSUPPORTED_CURRENCY", {
													currency: exchangeCurrency,
													provider: selectedMarketProvider.label,
												}),
											);

											setValue("exchangeCurrency", "USD", {
												shouldDirty: true,
												shouldValidate: true,
											});
										}

										setValue("marketProvider", selectedMarketProvider.value, {
											shouldDirty: true,
											shouldValidate: true,
										});
									}}
								/>
							</FormField>

							<FormField className="mt-5" name="timeFormat">
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
									onChange={(timeFormat: SettingsOption) => {
										if (timeFormat) {
											setValue("timeFormat", timeFormat.value, {
												shouldDirty: true,
												shouldValidate: true,
											});
										} else {
											setValue("timeFormat", "", { shouldDirty: true, shouldValidate: true });
										}
									}}
								/>
							</FormField>
						</div>
					</div>
				</SettingsGroup>

				<SettingsGroup title={t("SETTINGS.GENERAL.SECURITY.TITLE")}>
					<ListDivided items={securityItems} />
				</SettingsGroup>

				<SettingsGroup title={t("SETTINGS.GENERAL.APPEARANCE.TITLE")}>
					<ListDivided items={appearenceItems} />
				</SettingsGroup>

				<SettingsGroup title={t("SETTINGS.GENERAL.OTHER.TITLE")}>
					<ListDivided items={otherItems} />
				</SettingsGroup>

				<SettingsButtonGroup>
					<FormButtons>
						<Button
							disabled={isSaveButtonDisabled}
							type="submit"
							data-testid="General-settings__submit-button"
						>
							{t("COMMON.SAVE")}
						</Button>
					</FormButtons>
				</SettingsButtonGroup>
			</Form>
			<ResetProfile
				isOpen={isResetProfileOpen}
				profile={profile}
				onCancel={() => setIsResetProfileOpen(false)}
				onClose={() => setIsResetProfileOpen(false)}
				onReset={handleOnReset}
			/>
			<Prompt message={getPromptMessage} />
		</SettingsWrapper>
	);
};
