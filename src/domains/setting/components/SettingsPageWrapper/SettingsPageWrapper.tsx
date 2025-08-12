import { NavigationBlocker, NavigationBlockingProvider } from "@/app/contexts/Navigation/NavigationBlocking";
import { Page, Section } from "@/app/components/Layout";

import { Contracts } from "@/app/lib/profiles";
import { PageHeader } from "@/app/components/Header";
import React from "react";
import { SideBar } from "@/app/components/SideBar";
import { ThemeIcon } from "@/app/components/Icon";
import { useNavigate } from "react-router-dom";
import { useSettingsMenu } from "@/domains/setting/hooks/use-settings-menu";
import { useTranslation } from "react-i18next";

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
		<NavigationBlockingProvider>
			<NavigationBlocker />
			<Page pageTitle={t(`SETTINGS.${activeSettings.toUpperCase()}.MENU_ITEM`)} showBottomNavigationBar={false}>
				<PageHeader
					className="lg:-mb-4"
					title={t("SETTINGS.GENERAL.TITLE")}
					subtitle={t("SETTINGS.GENERAL.SUBTITLE")}
					titleIcon={
						<ThemeIcon
							dimensions={[54, 55]}
							lightIcon="SettingsLight"
							darkIcon="SettingsDark"
							dimIcon="SettingsDim"
						/>
					}
				/>

				<Section>
					<div className="flex flex-1">
						<div className="mx-auto flex w-full flex-col lg:container lg:flex-row lg:space-x-3">
							<div className="mb-4 md:-mt-4 lg:my-0">
								<SideBar
									items={menuItems}
									activeItem={activeSettings}
									handleActiveItem={(activeSetting: string) => {
										navigate(`/profiles/${profile.id()}/settings/${activeSetting}`);
									}}
								/>
							</div>

							<div className="border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 flex-1 sm:overflow-hidden sm:rounded-xl sm:border">
								{children}
							</div>
						</div>
					</div>
				</Section>
			</Page>
		</NavigationBlockingProvider>
	);
};
