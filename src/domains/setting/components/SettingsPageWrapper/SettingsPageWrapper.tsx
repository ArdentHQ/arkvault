import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { Page, Section } from "@/app/components/Layout";
import { SideBar } from "@/app/components/SideBar";
import { useSettingsMenu } from "@/domains/setting/hooks/use-settings-menu";

type ActiveSettings = "general" | "export" | "password" | "appearance" | "servers" | "networks";

export const SettingsWrapper = ({
	children,
	profile,
	activeSettings,
}: {
	profile: Contracts.IProfile;
	children: React.ReactNode;
	activeSettings: ActiveSettings;
}) => {
	const { menuItems } = useSettingsMenu();
	const navigate = useNavigate();

	const { t } = useTranslation();

	return (
		<Page
			pageTitle={t(`SETTINGS.${activeSettings.toUpperCase()}.MENU_ITEM`)}
			sidebar={
				<SideBar
					items={menuItems}
					activeItem={activeSettings}
					handleActiveItem={(activeSetting: string) => {
						navigate(`/profiles/${profile.id()}/settings/${activeSetting}`);
					}}
				/>
			}
		>
			<Section className="-mt-2 lg:mt-0" innerClassName="lg:px-12">
				{children}
			</Section>
		</Page>
	);
};
