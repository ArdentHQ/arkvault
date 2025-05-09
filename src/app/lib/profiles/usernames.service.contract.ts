export interface IUsernamesService {
	syncUsernames(addresses: string[]): Promise<void>;
	username(network: string, address: string): string | undefined;
	has(network: string, address: string): boolean;
}
