import { TFunction } from "react-i18next";

import { generatePath } from "react-router";
import { DropdownOption } from "@/app/components/Dropdown";
import { NavigationBarMenuItem } from "@/app/components/NavigationBar";
import { ProfilePaths } from "@/router/paths";

export const getNavigationMenu = (t: TFunction): NavigationBarMenuItem[] => [
	{
		mountPath: (profileId) => generatePath(ProfilePaths.Dashboard, { profileId }),
		title: t("COMMON.PORTFOLIO"),
	},
	{
		mountPath: (profileId) => generatePath(ProfilePaths.Exchange, { profileId }),
		title: t("COMMON.EXCHANGE"),
	},
	{
		mountPath: (profileId) => generatePath(ProfilePaths.News, { profileId }),
		title: t("COMMON.NEWS"),
	},
];

export const getUserMenuActions = (t: TFunction): (DropdownOption & NavigationBarMenuItem)[] => [
	{
		label: t("COMMON.CONTACTS"),
		mountPath: (profileId) => generatePath(ProfilePaths.Contacts, { profileId }),
		title: "contracts",
		value: "contacts",
	},
	{
		label: t("COMMON.VOTES"),
		mountPath: (profileId) => generatePath(ProfilePaths.Votes, { profileId }),
		title: "votes",
		value: "votes",
	},
	{
		label: t("COMMON.SETTINGS"),
		mountPath: (profileId) => generatePath(ProfilePaths.Settings, { profileId }),
		title: "settings",
		value: "settings",
	},
	{
		icon: "ArrowExternal",
		iconClassName: "text-theme-primary-600",
		isExternal: true,
		label: t("COMMON.SUPPORT"),
		mountPath: () => "https://arkvault.io/docs",
		title: "support",
		value: "support",
	},
	{
		label: t("COMMON.SIGN_OUT"),
		mountPath: () => `/`,
		title: "sign-out",
		value: "sign-out",
	},
];
