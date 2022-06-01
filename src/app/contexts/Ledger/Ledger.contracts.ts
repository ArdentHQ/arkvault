export interface LedgerData {
	address: string;
	path: string;
	balance?: number;
	isNew?: boolean;
}

export interface LedgerDerivationScheme {
	coinType: number;
	purpose?: number;
	account?: number;
	change?: number;
	address?: number;
}

export const minVersionList: Record<string, any> = {
	ARK: "2.1.0",
};
