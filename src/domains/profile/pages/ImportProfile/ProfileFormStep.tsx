import React from "react";
import { useTranslation } from "react-i18next";

import { Contracts, Environment, Helpers } from "@/app/lib/profiles";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { ProfileForm, ProfileFormState } from "@/domains/profile/components/ProfileForm";
import { ReadableFile } from "@/app/hooks/use-files";
import { StepHeader } from "@/app/components/StepHeader";
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

export const ImportProfileForm = ({
	profile,
	env,
	onSubmit,
	onBack,
	file,
	password,
	shouldValidate,
}: ImportProfileFormProperties) => {
	const { t } = useTranslation();

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

	return (
		<div className="mx-auto max-w-172" data-testid="ProfileFormStep">
			<StepHeader
				titleIcon={
					<ThemeIcon
						darkIcon="ImportProfileDark"
						lightIcon="ImportProfileLight"
						dimIcon="ImportProfileDim"
						dimensions={[24, 24]}
					/>
				}
				title={t("PROFILE.IMPORT.TITLE")}
				subtitle={t("PROFILE.IMPORT.FORM_STEP.DESCRIPTION")}
			/>

			<div className="border-theme-secondary-300 bg-theme-background dark:border-theme-secondary-800 mt-4 rounded-xl sm:border">
				<div className="bg-theme-secondary-100 rounded-xl p-4 sm:rounded-t-xl sm:rounded-b-none sm:px-6 sm:py-5 dark:bg-black">
					<FilePreview file={file} variant="success" useBorders={false} />
				</div>

				<div className="mb-16 pt-5 pb-6 sm:mb-0 sm:px-6">
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
