import { IProfile } from "./contracts.js";

export interface IUsernamesService {
	syncUsernames(profile: IProfile, coin: string, network: string, addresses: string[]): Promise<void>;
	username(network: string, address: string): string | undefined;
	has(network: string, address: string): boolean;
}
