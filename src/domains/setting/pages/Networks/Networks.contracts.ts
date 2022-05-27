export interface NodeConfigurationResponse {
	constants?: {
		epoch?: string;
	} & Record<string, any>;
	core?: {
		version?: string;
	};
	explorer?: string;
	nethash: string;
	ports?: Record<string, number | null>;
	slip44: number;
	symbol?: string;
	token?: string;
	transactionPool?: {
		dynamicFees:
			| {
					addonBytes?: Record<string, any>;
					enabled?: boolean;
					minFeeBroadcast?: number;
					minFeePool?: number;
			  }
			| undefined;
	} & Record<string, any>;
	version: number;
	wif: number;
}
