export interface ITokenDTO {
	address: string;
	decimals: number;
	deploymentHash: string;
	name: string;
	symbol: string;
	totalSupply: string;
}

export interface IWalletTokenData {
	address: string;
	balance: number;
	tokenAddress: string;
}

