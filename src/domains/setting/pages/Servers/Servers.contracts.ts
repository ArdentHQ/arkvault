import { Networks } from "@payvo/sdk";
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
	address: string;
	name: string;
	network?: string;
	serverType?: NetworkHostType;
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
	address: string;
	name: string;
	network: Networks.Network;
	serverType: Networks.NetworkHost["type"];
	online?: boolean;
	enabled: boolean;
	height?: number;
}

export enum ServerStatus {
	Online = "ONLINE",
	Offline = "OFFLINE",
	Loading = "LOADING",
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
