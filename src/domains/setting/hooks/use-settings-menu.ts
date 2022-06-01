import { useTranslation } from "react-i18next";

export const useSettingsMenu = () => {
	const { t } = useTranslation();

	const menuItems = [
		{
			icon: "Sliders",
			itemKey: "general",
			label: t("SETTINGS.GENERAL.MENU_ITEM"),
			route: "general",
		},
		{
			icon: "Lock",
			itemKey: "password",
			label: t("SETTINGS.PASSWORD.MENU_ITEM"),
			route: "password",
		},
		{
			icon: "PencilRuler",
			itemKey: "appearance",
			label: t("SETTINGS.APPEARANCE.MENU_ITEM"),
			route: "appearance",
		},
		{
			icon: "Globe",
			itemKey: "networks",
			label: t("SETTINGS.NETWORKS.MENU_ITEM"),
			route: "networks",
		},
		{
			icon: "Server",
			itemKey: "servers",
			label: t("SETTINGS.SERVERS.MENU_ITEM"),
			route: "servers",
		},
		{
			icon: "ArrowUpTurnBracket",
			itemKey: "export",
			label: t("SETTINGS.EXPORT.MENU_ITEM"),
			route: "export",
		},
	];

	return { menuItems };
};
