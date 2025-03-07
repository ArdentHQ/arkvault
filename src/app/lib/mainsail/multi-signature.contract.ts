import { Interfaces } from "./crypto/index";

export type MultiSignatureTransaction = Interfaces.ITransactionData & {
	multiSignature: Interfaces.IMultiSignatureAsset;
};

// export type MultiSignatureTransaction = Interfaces.ITransactionData;

export type MultiSignatureAsset = Interfaces.IMultiSignatureAsset;
