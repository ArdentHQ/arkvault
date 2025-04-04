import { useTranslation } from "react-i18next";

export const useSettingsMenu = () => {
	const { t } = useTranslation();

	const menuItems = [
		{
			itemKey: "general",
			label: t("SETTINGS.GENERAL.MENU_ITEM"),
			route: "general",
		},
		{
			itemKey: "password",
			label: t("SETTINGS.PASSWORD.MENU_ITEM"),
			route: "password",
		},
		{
			itemKey: "servers",
			label: t("SETTINGS.SERVERS.MENU_ITEM"),
			route: "servers",
		},
		{
			itemKey: "export",
			label: t("SETTINGS.EXPORT.MENU_ITEM"),
			route: "export",
		},
	];

	return { menuItems };
};
