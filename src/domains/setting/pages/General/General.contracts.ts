interface GeneralSettingsState {
	automaticSignOutPeriod: string;
	avatar: string;
	bip39Locale: string;
	exchangeCurrency: string;
	locale: string;
	marketProvider: string;
	name: string;
	timeFormat: string;
}

interface SettingsOption {
	label: string;
	value: string | number;
	unsupportedCurrencies?: string[];
}

export type { GeneralSettingsState, SettingsOption };
