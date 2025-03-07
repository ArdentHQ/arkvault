import { BigNumber, ByteBuffer } from "@ardenthq/sdk-helpers";
import { ErrorObject } from "ajv";

export interface ITransaction {
	readonly id: string | undefined;
	readonly typeGroup: number | undefined;
	readonly type: number;
	readonly verified: boolean;
	readonly key: string;
	readonly staticFee: BigNumber;

	isVerified: boolean;

	data: ITransactionData;
	serialized: Buffer;
	timestamp: number;

	serialize(options?: ISerializeOptions): ByteBuffer | undefined;
	deserialize(buf: ByteBuffer): void;

	verify(options?: IVerifyOptions): boolean;
	verifySchema(strict?: boolean): ISchemaValidationResult;

	toJson(): ITransactionJson;

	hasVendorField(): boolean;
}

export interface ITransactionAsset {
	[custom: string]: any;

	signature?: {
		publicKey: string;
	};
	delegate?: {
		username: string;
	};
	votes?: string[];
	multiSignatureLegacy?: IMultiSignatureLegacyAsset;
	multiSignature?: IMultiSignatureAsset;
	payments?: IMultiPaymentItem[];
}

export interface ITransactionData {
	version?: number;
	network?: number;

	typeGroup?: number;
	type: number;
	timestamp: number;
	nonce?: BigNumber;
	senderPublicKey: string | undefined;

	fee: BigNumber;
	amount: BigNumber;

	expiration?: number;
	recipientId?: string;

	asset?: ITransactionAsset;
	vendorField?: string;

	id?: string;
	signature?: string;
	signSignature?: string;
	signatures?: string[];

	blockId?: string;
	blockHeight?: number;
	sequence?: number;
}

export interface ITransactionJson {
	version?: number;
	network?: number;

	typeGroup?: number;
	type: number;

	timestamp?: number;
	nonce?: string;
	senderPublicKey: string;

	fee: string;
	amount: string;

	expiration?: number;
	recipientId?: string;

	asset?: ITransactionAsset;
	vendorField?: string | undefined;

	id?: string;
	signature?: string;
	signSignature?: string;
	signatures?: string[];

	blockId?: string;
	sequence?: number;
}

export interface ISchemaValidationResult<T = any> {
	value: T | undefined;
	error: any;
	errors?: ErrorObject[] | undefined;
}

export interface IMultiPaymentItem {
	amount: BigNumber;
	recipientId: string;
}

export interface IMultiSignatureLegacyAsset {
	min: number;
	lifetime: number;
	keysgroup: string[];
}

export interface IMultiSignatureAsset {
	min: number;
	publicKeys: string[];
}

export interface IDeserializeOptions {
	acceptLegacyVersion?: boolean;
	disableVersionCheck?: boolean;
}

export interface IVerifyOptions {
	disableVersionCheck?: boolean;
}

export interface ISerializeOptions {
	acceptLegacyVersion?: boolean;
	disableVersionCheck?: boolean;
	excludeSignature?: boolean;
	excludeMultiSignature?: boolean;
}
