import { Coins, Http, Networks, Services } from "@ardenthq/sdk";

import { IProfile } from "./profile.contract.js";

export type CoinList = Record<string, Coins.CoinBundle>;

export interface CoinType {
	coin: string;
	network: string;
	ticker: string;
	symbol: string;
}

export type NetworkHostSelectorFactory = (profile: IProfile) => Networks.NetworkHostSelector;

export interface EnvironmentOptions {
	coins: CoinList;
	storage: string | Storage;
	hostSelector?: NetworkHostSelectorFactory;
	httpClient: Http.HttpClient;
	ledgerTransportFactory?: Services.LedgerTransportFactory;
	migrations?: Record<string, any>;
}

export interface Storage {
	all<T = Record<string, unknown>>(): Promise<T>;

	get<T>(key: string): Promise<T | undefined>;

	set(key: string, value: string | object): Promise<void>;

	forget(key: string): Promise<void>;

	flush(): Promise<void>;

	count(): Promise<number>;

	snapshot(): Promise<void>;

	restore(): Promise<void>;
}

export interface StorageData {
	data: Record<string, unknown>;
	profiles: Record<string, unknown>;
}
