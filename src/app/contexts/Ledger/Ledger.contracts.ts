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

export type LedgerTransport = any;
export type ILedgerTransportFactory = () => Promise<LedgerTransport>;
export type LedgerWalletList = Record<string, unknown>;

export interface LedgerService {
	connect(): Promise<void>;

	disconnect(): Promise<void>;

	getVersion(): Promise<string>;

	getPublicKey(path: string): Promise<string>;

	getExtendedPublicKey(path: string): Promise<string>;

	signTransaction(path: string, payload: Buffer): Promise<string>;

	signMessage(path: string, payload: string): Promise<string>;

	scan(options?: {
		useLegacy: boolean;
		startPath?: string;
		onProgress?: (wallet: unknown) => void;
	}): Promise<Record<string, unknown>>;

	isNanoS(): Promise<boolean>;

	isNanoX(): Promise<boolean>;
}
