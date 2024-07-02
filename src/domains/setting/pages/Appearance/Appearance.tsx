import React from "react";
import { useTranslation } from "react-i18next";

import { Header } from "@/app/components/Header";
import { useActiveProfile } from "@/app/hooks";
import { SettingsWrapper } from "@/domains/setting/components/SettingsPageWrapper";

import { AppearanceForm } from "./blocks/AppearanceForm";

export const AppearanceSettings: React.FC = () => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	return (
		<SettingsWrapper profile={profile} activeSettings="appearance">
			<Header title={t("SETTINGS.APPEARANCE.TITLE")} subtitle={t("SETTINGS.APPEARANCE.SUBTITLE")} />

			<AppearanceForm profile={profile} />
		</SettingsWrapper>
	);
};
