import { generatePath } from "react-router";
import { Contracts } from "@ardenthq/sdk-profiles";

import { TFunction } from "@/app/i18n/react-i18next.contracts";
import { DropdownOption } from "@/app/components/Dropdown";
import { NavigationBarMenuItem } from "@/app/components/NavigationBar";
import { ProfilePaths } from "@/router/paths";
import { isE2E, isUnit } from "@/utils/test-helpers";
import { hasOnlyMainsailNetwork } from "@/utils/network-utils";

export const getNavigationMenu = (profile: Contracts.IProfile, t: TFunction): NavigationBarMenuItem[] => [
	{
		mountPath: (profileId) => generatePath(ProfilePaths.Dashboard, { profileId }),
		title: t("COMMON.PORTFOLIO"),
	},
	/* istanbul ignore next -- @preserve */
	...(isUnit() ?? isE2E() ?? !hasOnlyMainsailNetwork(profile) ? [{
		mountPath: (profileId) => generatePath(ProfilePaths.Exchange, { profileId }),
		title: t("COMMON.EXCHANGE"),
	}] : []),
	{
		mountPath: (profileId) => generatePath(ProfilePaths.Contacts, { profileId }),
		title: t("COMMON.CONTACTS"),
	},
	{
		mountPath: (profileId) => generatePath(ProfilePaths.Votes, { profileId }),
		title: t("COMMON.VOTES"),
	},
];

export const getUserMenuActions = (t: TFunction): (DropdownOption & NavigationBarMenuItem)[] => [
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
		label: t("COMMON.DOCUMENTATION"),
		mountPath: () => "https://arkvault.io/docs",
		title: "support",
		value: "support",
	},
	{
		label: t("COMMON.CONTACT_US"),
		mountPath: () => "/",
		title: "contact",
		value: "contact",
	},
	{
		label: t("COMMON.SIGN_OUT"),
		mountPath: () => "/",
		title: "sign-out",
		value: "sign-out",
	},
];
