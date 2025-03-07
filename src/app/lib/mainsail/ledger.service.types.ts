export interface LedgerDerivationScheme {
	coinType: number;
	purpose?: number;
	account?: number;
	change?: number;
	address?: number;
}
