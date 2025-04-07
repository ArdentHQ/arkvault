export interface LedgerDerivationScheme {
	coinType: number;
	purpose?: number;
	account?: number;
	change?: number;
	address?: number;
}

export type LedgerTransport = any;
export type LedgerTransportInstance = any;
export type SetupLedgerFactory = (transport: LedgerTransport) => LedgerTransportInstance;
export type LedgerSignature = { r: string; v: string; s: string };
