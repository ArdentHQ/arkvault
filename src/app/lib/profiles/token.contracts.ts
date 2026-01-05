export interface TokenData {
	address: string;
	decimals: number;
	deploymentHash: string;
	name: string;
	symbol: string;
	totalSupply: string;
}

export interface WalletTokenData {
	address: string;
	balance: number;
	tokenAddress: string;
}

export interface TokenAddressesData {
	addresses: Record<string, string>;
	decimals: number;
	name: string;
	symbol: string;
	supply: string;
	token: string;
}
