import { ViewingModeType } from "@/app/hooks";

interface GeneralSettingsState {
	automaticSignOutPeriod: string;
	avatar: string;
	bip39Locale: string;
	exchangeCurrency: string;
	locale: string;
	marketProvider: string;
	name: string;
	timeFormat: string;
	useNetworkWalletNames: boolean;
	viewingMode: ViewingModeType;
	showDevelopmentNetwork: boolean;
	useHDWallets: boolean;
}

interface SettingsOption {
	label: string;
	value: string | number;
	unsupportedCurrencies?: string[];
}

export type { GeneralSettingsState, SettingsOption };
