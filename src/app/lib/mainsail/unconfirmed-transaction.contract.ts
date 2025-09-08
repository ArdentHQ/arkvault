export interface UnconfirmedTransaction {
	network: number;
	nonce: string;
	gasPrice: string;
	to: string;
	value: string;
	data: string;
	v: number;
	r: string;
	s: string;
	senderPublicKey: string;
	from: string;
	hash: string;
}

export interface UnconfirmedTransactionsResponse {
	results: UnconfirmedTransaction[];
	totalCount: number;
}
