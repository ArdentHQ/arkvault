import { BigNumber, ByteBuffer } from "@/app/lib/helpers";
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
	validator?: {
		publicKey: string;
	};
	votes?: string[];
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
	value: BigNumber;

	expiration?: number;
	recipientId?: string;

	asset?: ITransactionAsset;
	vendorField?: string;

	hash?: string;
	signature?: string;
	signSignature?: string;
	signatures?: string[];

	blockHash?: string;
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
	value: string;

	expiration?: number;
	recipientId?: string;

	asset?: ITransactionAsset;
	vendorField?: string | undefined;

	hash?: string;
	signature?: string;
	signSignature?: string;
	signatures?: string[];

	blockHash?: string;
	sequence?: number;
}

export interface ISchemaValidationResult<T = any> {
	value: T | undefined;
	error: any;
	errors?: ErrorObject[] | undefined;
}

export interface IMultiPaymentItem {
	value: BigNumber;
	recipientId: string;
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
}
