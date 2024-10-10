import React from "react";
import { useTranslation } from "react-i18next";

import { AppearanceForm } from "./blocks/AppearanceForm";
import { Header } from "@/app/components/Header";
import { useActiveProfile } from "@/app/hooks";
import { SettingsWrapper } from "@/domains/setting/components/SettingsPageWrapper";

export const AppearanceSettings: React.FC = () => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	return (
		<SettingsWrapper profile={profile} activeSettings="appearance">
			<Header
				title={t("SETTINGS.APPEARANCE.TITLE")}
				subtitle={t("SETTINGS.APPEARANCE.SUBTITLE")}
				titleClassName="mb-2 text-2xl"
			/>

			<AppearanceForm profile={profile} />
		</SettingsWrapper>
	);
};
