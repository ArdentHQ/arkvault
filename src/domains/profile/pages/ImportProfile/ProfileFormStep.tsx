import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Contracts, Environment, Helpers } from "@ardenthq/sdk-profiles";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { ProfileForm, ProfileFormState } from "@/domains/profile/components/ProfileForm";
import { ReadableFile } from "@/app/hooks/use-files";
import { StepHeader } from "@/app/components/StepHeader";
import { useAccentColor } from "@/app/hooks";
import { ThemeIcon } from "@/app/components/Icon";

interface ImportProfileFormProperties {
	file?: ReadableFile;
	profile: Contracts.IProfile;
	password?: string;
	env: Environment;
	shouldValidate: boolean;
	showPasswordFields?: boolean;
	onSubmit: (profile: Contracts.IProfile) => void;
	onBack: () => void;
}

export const ImportProfileForm: React.VFC<ImportProfileFormProperties> = ({
	profile,
	env,
	onSubmit,
	onBack,
	file,
	password,
	shouldValidate,
}) => {
	const { t } = useTranslation();
	const { setProfileAccentColor } = useAccentColor();

	const handleSubmit = async ({
		avatarImage,
		name,
		password: enteredPassword,
		currency,
		viewingMode,
	}: ProfileFormState) => {
		env.profiles().push(profile);
		await env.profiles().restore(profile, password);

		profile.settings().set(Contracts.ProfileSetting.Name, name.trim());
		profile.settings().set(Contracts.ProfileSetting.Theme, viewingMode);
		profile.settings().set(Contracts.ProfileSetting.ExchangeCurrency, currency);

		profile
			.settings()
			.set(Contracts.ProfileSetting.Avatar, avatarImage || Helpers.Avatar.make(profile.name().trim()));

		if (enteredPassword || password) {
			// @ts-ignore
			profile.auth().setPassword(enteredPassword || password);
		}

		onSubmit(profile);
	};

	useEffect(() => {
		setProfileAccentColor(profile);
	}, []);

	return (
		<div className="mx-auto max-w-xl" data-testid="ProfileFormStep">
			<StepHeader
				titleIcon={
					<ThemeIcon darkIcon="ImportProfileDark" lightIcon="ImportProfileLight" dimensions={[24, 24]} />
				}
				title={t("PROFILE.IMPORT.TITLE")}
				subtitle={t("PROFILE.IMPORT.FORM_STEP.DESCRIPTION")}
			/>

			<div className="mt-4 rounded-xl border-theme-secondary-300 bg-theme-background dark:border-theme-secondary-800 sm:border">
				<div className="rounded-xl bg-theme-secondary-100 p-4 dark:bg-black sm:rounded-b-none sm:rounded-t-xl sm:px-6 sm:py-5">
					<FilePreview file={file} variant="success" useBorders={false} />
				</div>

				<div className="mb-16 pb-6 pt-5 sm:mb-0 sm:px-6">
					<ProfileForm
						defaultValues={{
							avatarImage: profile.settings().get(Contracts.ProfileSetting.Avatar, ""),
							confirmPassword: password,
							currency: profile.settings().get(Contracts.ProfileSetting.ExchangeCurrency),
							name: profile.name(),
							password,
							viewingMode: profile.settings().get(Contracts.ProfileSetting.Theme),
						}}
						onBack={onBack}
						onSubmit={handleSubmit}
						shouldValidate={shouldValidate}
						showPasswordFields={!profile.usesPassword()}
					/>
				</div>
			</div>
		</div>
	);
};
