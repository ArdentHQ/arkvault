import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { AppearanceSettingsState, UseAppearanceSettings } from "./Appearance.contracts";
import { AppearanceAccentColor } from "./blocks/AppearanceAccentColor";
import { AppearanceToggle } from "./blocks/AppearanceToggle";
import { AppearanceViewingMode } from "./blocks/AppearanceViewingMode";
import { ListDividedItemProperties } from "@/app/components/ListDivided/ListDivided.contracts";
import { AccentColorType, ViewingModeType } from "@/app/hooks";

export const useAppearanceItems = (): ListDividedItemProperties[] => {
	const { t } = useTranslation();

	const options = [
		{
			itemValueClass: "ml-5",
			label: `${t("SETTINGS.APPEARANCE.OPTIONS.ACCENT_COLOR.TITLE")}`,
			labelDescription: `${t("SETTINGS.APPEARANCE.OPTIONS.ACCENT_COLOR.DESCRIPTION")}`,
			value: <AppearanceAccentColor />,
			wrapperClass: "pb-6",
		},
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

	return options;
};

export const useAppearanceSettings = (profile: Contracts.IProfile): UseAppearanceSettings => ({
	getValues: (): AppearanceSettingsState => ({
		accentColor: (() => {
			let accentColor = profile.appearance().get("accentColor");

			if (accentColor === "blue") {
				accentColor = "navy";
			}

			return accentColor as AccentColorType;
		})(),
		dashboardTransactionHistory: profile.appearance().get("dashboardTransactionHistory"),
		useNetworkWalletNames: profile.appearance().get("useNetworkWalletNames"),
		viewingMode: profile.appearance().get("theme") as ViewingModeType,
	}),
	setValues: (values: AppearanceSettingsState): void => {
		profile.settings().set(Contracts.ProfileSetting.AccentColor, values.accentColor);
		profile
			.settings()
			.set(Contracts.ProfileSetting.DashboardTransactionHistory, values.dashboardTransactionHistory);
		profile.settings().set(Contracts.ProfileSetting.Theme, values.viewingMode);
		profile.settings().set(Contracts.ProfileSetting.UseNetworkWalletNames, values.useNetworkWalletNames);
	},
});
