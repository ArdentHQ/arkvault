export interface NetworkConfig {
	milestones: Array<Record<string, any>>;
	network: Network;
}

export interface Network {
	name: string;
	messagePrefix: string;
	bip32: {
		public: number;
		private: number;
	};
	pubKeyHash: number;
	nethash: string;
	wif: number;
	slip44: number;
	aip20: number;
	chainId: number;
	client: {
		token: string;
		symbol: string;
		explorer: string;
	};
}
