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
	balance: string;
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

export interface TransactionTokenData {
	from: string;
	to: string;
	value: string;
	index: number;
	metadata: {
		tokenAddress: string;
		tokenDecimals: number;
		tokenName: string;
		tokenSymbol: string;
	};
}
