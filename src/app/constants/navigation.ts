import { generatePath } from "react-router";

import { TFunction } from "@/app/i18n/react-i18next.contracts";
import { DropdownOptionGroup } from "@/app/components/Dropdown";
import { NavigationBarMenuItem } from "@/app/components/NavigationBar";
import { ProfilePaths } from "@/router/paths";

export const getNavigationMenu = (t: TFunction, pathname: string): NavigationBarMenuItem[] => {
	const menuItems: NavigationBarMenuItem[] = [
		{
			isActive: pathname.includes("/dashboard"),
			mountPath: (profileId) => generatePath(ProfilePaths.Dashboard, { profileId }),
			title: t("COMMON.PORTFOLIO"),
		},
		{
			isActive: pathname.includes("/tokens"),
			mountPath: (profileId) => generatePath(ProfilePaths.Tokens, { profileId }),
			title: t("COMMON.TOKENS"),
		},
		{
			isActive: pathname.includes("/exchange"),
			mountPath: (profileId) => generatePath(ProfilePaths.Exchange, { profileId }),
			title: t("COMMON.EXCHANGE"),
		},
		{
			isActive: pathname.includes("/contacts"),
			mountPath: (profileId) => generatePath(ProfilePaths.Contacts, { profileId }),
			title: t("COMMON.CONTACTS"),
		},
		{
			isActive: pathname.includes("/votes"),
			mountPath: (profileId) => generatePath(ProfilePaths.Votes, { profileId }),
			title: t("COMMON.VOTES"),
		},
	];

	if (import.meta.env.VITE_HIDE_EXCHANGE_TAB === "true") {
		return menuItems.filter((menuItem) => menuItem.title !== t("COMMON.EXCHANGE"));
	}

	return menuItems;
};

export const getUserMenuActions = (t: TFunction): DropdownOptionGroup[] => [
	{
		key: "main",
		options: [
			{
				label: t("COMMON.SETTINGS"),
				mountPath: (profileId) => generatePath(ProfilePaths.Settings, { profileId }),
				title: "settings",
				value: "settings",
			},
			{
				label: t("COMMON.CONTACT_US"),
				mountPath: () => "/",
				title: "contact",
				value: "contact",
			},
		],
	},
	{
		hasDivider: true,
		key: "other",
		options: [
			{
				icon: "ArrowExternal",
				iconPosition: "start",
				isExternal: true,
				label: t("COMMON.DOCS"),
				mountPath: () => "https://arkvault.io/docs",
				title: "support",
				value: "support",
			},
			{
				icon: "SignOut",
				iconPosition: "start",
				label: t("COMMON.SIGN_OUT"),
				mountPath: () => "/",
				title: "sign-out",
				value: "sign-out",
			},
		],
	},
];
