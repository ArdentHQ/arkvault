import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useLayoutEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { Header } from "@/app/components/Header";
import { Page } from "@/app/components/Layout";
import { useEnvironmentContext } from "@/app/contexts";
import { useLocaleCurrency, useTheme } from "@/app/hooks";

import { ProfileForm, ProfileFormState } from "@/domains/profile/components/ProfileForm";
import { ThemeIcon } from "@/app/components/Icon";
import { generatePath } from "react-router-dom";
import { ProfilePaths } from "@/router/paths";

export const CreateProfile = () => {
	const { env, persist } = useEnvironmentContext();
	const { t } = useTranslation();
	const history = useHistory();

	const { theme, resetTheme } = useTheme();
	const { defaultCurrency } = useLocaleCurrency();

	useLayoutEffect(() => {
		resetTheme();
	}, [resetTheme]);

	const { setProfileTheme } = useTheme();

	const handleSubmit = async ({ name, password, currency, viewingMode }: ProfileFormState) => {
		const profile = await env.profiles().create(name.trim());
		await env.profiles().restore(profile);

		profile.settings().set(Contracts.ProfileSetting.ExchangeCurrency, currency);
		profile.settings().set(Contracts.ProfileSetting.Theme, viewingMode);

		if (password) {
			profile.auth().setPassword(password);
		}

		await persist();

		setProfileTheme(profile);

		history.push(generatePath(ProfilePaths.Dashboard, { profileId: profile.id() }));
	};

	return (
		<Page
			pageTitle={t("PROFILE.PAGE_CREATE_PROFILE.TITLE")}
			navbarVariant="logo-only"
			title={<Trans i18nKey="COMMON.APP_NAME" />}
			wrapperClassName="pb-32 sm:pb-16"
		>
			<div className="flex h-page sm:h-auto sm:items-center" data-testid="CreateProfile">
				<div className="mx-auto max-w-172 px-6">
					<Header
						title={t("PROFILE.PAGE_CREATE_PROFILE.TITLE")}
						titleClassName="text-lg leading-[21px] sm:text-2xl sm:leading-[29px]"
						titleIcon={<ThemeIcon darkIcon="PersonDark" lightIcon="PersonLight" dimensions={[24, 24]} />}
						subtitle={t("PROFILE.PAGE_CREATE_PROFILE.DESCRIPTION")}
						className="block"
					/>

					<div className="mb-16 mt-4 rounded-lg border-theme-secondary-300 bg-theme-background pt-1 dark:border-theme-secondary-800 sm:mb-0 sm:border sm:p-6 md:w-172">
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
			</div>
		</Page>
	);
};
