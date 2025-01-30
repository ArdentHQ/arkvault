import { ViewingModeType } from "@/app/hooks";

interface AppearanceSettingsState {
	dashboardTransactionHistory: boolean;
	useNetworkWalletNames: boolean;
	viewingMode: ViewingModeType;
}

interface UseAppearanceSettings {
	getValues: () => AppearanceSettingsState;
	setValues: (values: AppearanceSettingsState) => void;
}

export type { AppearanceSettingsState, UseAppearanceSettings };
