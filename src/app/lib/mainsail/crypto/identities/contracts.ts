export interface KeyPair {
	publicKey: string;
	privateKey: string;
	compressed: boolean;
}

export interface MultiSignatureAsset {
	min: number;
	publicKeys: string[];
}
