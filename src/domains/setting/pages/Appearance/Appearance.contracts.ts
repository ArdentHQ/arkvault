import { AccentColorType, ViewingModeType } from "@/app/hooks";

interface AppearanceSettingsState {
	accentColor: AccentColorType;
	dashboardTransactionHistory: boolean;
	useExpandedTables: boolean;
	useNetworkWalletNames: boolean;
	viewingMode: ViewingModeType;
}

interface UseAppearanceSettings {
	getValues: () => AppearanceSettingsState;
	setValues: (values: AppearanceSettingsState) => void;
}

export type { AppearanceSettingsState, UseAppearanceSettings };
