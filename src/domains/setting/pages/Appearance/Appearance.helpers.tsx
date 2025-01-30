import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { AppearanceSettingsState, UseAppearanceSettings } from "./Appearance.contracts";
import { AppearanceToggle } from "./blocks/AppearanceToggle";
import { AppearanceViewingMode } from "./blocks/AppearanceViewingMode";
import { ListDividedItemProperties } from "@/app/components/ListDivided/ListDivided.contracts";
import { ViewingModeType } from "@/app/hooks";

export const useAppearanceItems = (): ListDividedItemProperties[] => {
	const { t } = useTranslation();

	return [
		{
			itemValueClass: "ml-5",
			label: `${t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.TITLE")}`,
			labelDescription: `${t("SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.DESCRIPTION")}`,
			value: <AppearanceViewingMode />,
			wrapperClass: "py-6",
		},
		{
			label: t("SETTINGS.APPEARANCE.OPTIONS.LATEST_TRANSACTIONS.TITLE"),
			labelAddon: <AppearanceToggle name="dashboardTransactionHistory" />,
			labelDescription: t("SETTINGS.APPEARANCE.OPTIONS.LATEST_TRANSACTIONS.DESCRIPTION"),
			wrapperClass: "py-6",
		},
		{
			label: t("SETTINGS.APPEARANCE.OPTIONS.WALLET_NAMING.TITLE"),
			labelAddon: <AppearanceToggle name="useNetworkWalletNames" />,
			labelDescription: t("SETTINGS.APPEARANCE.OPTIONS.WALLET_NAMING.DESCRIPTION"),
			wrapperClass: "pt-6 sm:pb-6",
		},
	];
};

export const useAppearanceSettings = (profile: Contracts.IProfile): UseAppearanceSettings => ({
	getValues: (): AppearanceSettingsState => ({
		dashboardTransactionHistory: profile.appearance().get("dashboardTransactionHistory"),
		useNetworkWalletNames: profile.appearance().get("useNetworkWalletNames"),
		viewingMode: profile.appearance().get("theme") as ViewingModeType,
	}),
	setValues: (values: AppearanceSettingsState): void => {
		profile
			.settings()
			.set(Contracts.ProfileSetting.DashboardTransactionHistory, values.dashboardTransactionHistory);
		profile.settings().set(Contracts.ProfileSetting.Theme, values.viewingMode);
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, values.useNetworkWalletNames);
	},
});
