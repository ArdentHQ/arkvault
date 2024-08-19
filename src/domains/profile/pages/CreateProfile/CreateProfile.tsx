import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useLayoutEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { Header } from "@/app/components/Header";
import { Page, Section } from "@/app/components/Layout";
import { useEnvironmentContext } from "@/app/contexts";
import { useLocaleCurrency, useProfileRestore, useTheme } from "@/app/hooks";

import { ProfileForm, ProfileFormState } from "@/domains/profile/components/ProfileForm";

export const CreateProfile = () => {
	const { env, persist } = useEnvironmentContext();
	const { restoreProfileConfig } = useProfileRestore();
	const { t } = useTranslation();
	const history = useHistory();

	const { theme, resetTheme } = useTheme();
	const { defaultCurrency } = useLocaleCurrency();

	useLayoutEffect(() => {
		resetTheme();

		return () => {
			resetTheme();
		};
	}, [resetTheme]);

	const handleSubmit = async ({ avatarImage, name, password, currency, viewingMode }: ProfileFormState) => {
		const profile = await env.profiles().create(name.trim());
		await env.profiles().restore(profile);

		profile.settings().set(Contracts.ProfileSetting.ExchangeCurrency, currency);
		profile.settings().set(Contracts.ProfileSetting.Theme, viewingMode);
		profile.settings().set(Contracts.ProfileSetting.Avatar, avatarImage);

		if (password) {
			profile.auth().setPassword(password);
		}

		restoreProfileConfig(profile);
		await persist();

		history.push("/");
	};

	return (
		<Page
			pageTitle={t("PROFILE.PAGE_CREATE_PROFILE.TITLE")}
			navbarVariant="logo-only"
			title={<Trans i18nKey="COMMON.APP_NAME" />}
		>
			<Section className="flex flex-1 flex-col sm:-mt-5 sm:justify-center">
				<div className="mx-auto max-w-lg" data-testid="CreateProfile">
					<Header
						title={t("PROFILE.PAGE_CREATE_PROFILE.TITLE")}
						subtitle={t("PROFILE.PAGE_CREATE_PROFILE.DESCRIPTION")}
						className="hidden sm:block"
					/>

					<div className="-mt-8 mb-16 rounded-lg border-theme-secondary-300 bg-theme-background pt-1 dark:border-theme-secondary-800 sm:mb-0 sm:mt-6 sm:border sm:p-10">
						<ProfileForm
							defaultValues={{
								currency: defaultCurrency,
								viewingMode: theme,
							}}
							onBack={() => history.push("/")}
							onSubmit={handleSubmit}
							shouldValidate={false}
							showPasswordFields={true}
						/>
					</div>
				</div>
			</Section>
		</Page>
	);
};
