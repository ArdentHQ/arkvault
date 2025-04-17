import { Networks } from "@ardenthq/sdk";
import { OptionProperties } from "@/app/components/SelectDropdown";

interface ServersSettingsState {
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

interface NetworkSelectProperties extends OptionProperties {
	network: Networks.Network;
}
type NetworkHostType = Networks.NetworkHost["type"];

interface CustomNetwork {
	evmApiEndpoint: string;
	publicApiEndpoint: string;
	transactionApiEndpoint: string;
	name: string;
	network?: string;
}
interface UserCustomNetwork {
	address: string;
	name: string;
	slip44: string;
	explorer?: string;
	ticker?: string;
	knownWallets?: string;
	type: "test" | "live";
}

interface NormalizedNetwork {
	publicApiEndpoint: string;
	transactionApiEndpoint: string;
	evmApiEndpoint: string;
	name: string;
	network: Networks.Network;
	online?: boolean;
	enabled: boolean;
	height?: number;
}

export enum ServerHealthStatus {
	Healthy,
	Downgraded,
	Unavailable,
}

export type {
	ServersSettingsState,
	SettingsOption,
	NetworkSelectProperties,
	CustomNetwork,
	NetworkHostType,
	NormalizedNetwork,
	UserCustomNetwork,
};
