export interface EvmCallData {
	from?: string;
	to: string;
	data: string;
	block?: string;
}

export interface EvmCallResponse {
	id: number;
	jsonrpc: string;
	result: `0x${string}`;
}
