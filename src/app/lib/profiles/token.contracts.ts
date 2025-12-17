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
