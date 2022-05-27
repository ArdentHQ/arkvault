import React from "react";
import { useTranslation } from "react-i18next";

import { Contracts, Environment } from "@payvo/sdk-profiles";
import { Divider } from "@/app/components/Divider";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { ProfileForm, ProfileFormState } from "@/domains/profile/components/ProfileForm";
import { ReadableFile } from "@/app/hooks/use-files";
import { StepHeader } from "@/app/components/StepHeader";

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
		profile.settings().set(Contracts.ProfileSetting.Avatar, avatarImage);
		profile.settings().set(Contracts.ProfileSetting.ExchangeCurrency, currency);

		if (enteredPassword || password) {
			// @ts-ignore
			profile.auth().setPassword(enteredPassword || password);
		}

		onSubmit(profile);
	};

	return (
		<div className="mx-auto max-w-xl">
			<StepHeader title={t("PROFILE.IMPORT.TITLE")} subtitle={t("PROFILE.IMPORT.FORM_STEP.DESCRIPTION")} />

			<div className="rounded-lg border-theme-secondary-300 bg-theme-background dark:border-theme-secondary-800 sm:mt-6 sm:border sm:p-10">
				<div className="mt-6 sm:mt-0">
					<FilePreview file={file} variant="success" useBorders={false} />
				</div>

				<Divider />

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
	);
};
