import { BigNumber } from "@/app/lib/helpers";

export type KeyValuePair = Record<string, any>;

export interface WalletBalance {
	total: BigNumber;
	available: BigNumber;
	fees: BigNumber;
	locked?: BigNumber;
	lockedVotes?: BigNumber;
	lockedUnvotes?: BigNumber;
	tokens?: Record<string, BigNumber>;
}

export interface WalletMultiSignature {
	// Standard
	min?: number;
	publicKeys?: string[];
	limit?: number;
	// Advanced
	mandatoryKeys?: string[];
	numberOfSignatures?: number;
	optionalKeys?: string[];
}

export interface WalletData {
	fill(data: any): WalletData;

	// Wallet
	primaryKey(): string;

	address(): string;

	publicKey(): string | undefined;

	balance(): WalletBalance;

	nonce(): BigNumber;

	// Second Signature
	secondPublicKey(): string | undefined;

	// Delegate
	username(): string | undefined;

	validatorPublicKey(): string | undefined;

	validatorFee(): number | undefined;

	rank(): number | undefined;

	votes(): BigNumber | undefined;

	// Flags
	isValidator(): boolean;

	isResignedDelegate(): boolean;

	isValidator(): boolean;

	isResignedValidator(): boolean;

	isSecondSignature(): boolean;

	toObject(): KeyValuePair;

	hasPassed(): boolean;

	hasFailed(): boolean;

	isSelected(): boolean;
}

type LedgerTransport = any;

// @TODO: export those directly from the files and get rid of this whole file
export type { LedgerTransport };

export type {
	ConfirmedTransactionData,
	MultiPaymentRecipient,
	TransactionDataMeta,
	UnspentTransactionData,
} from "./confirmed-transaction.dto.contract.js";
export type { EvmCallData, EvmCallResponse } from "./evm.contract.js";
export type { RawTransactionData, SignedTransactionData } from "./signed-transaction.dto.contract.js";

export interface NetworkConfig {
	milestones: Array<Record<string, any>>;
	network: Network;
}

export interface Network {
	name: string;
	messagePrefix: string;
	bip32: {
		public: number;
		private: number;
	};
	pubKeyHash: number;
	nethash: string;
	wif: number;
	slip44: number;
	aip20: number;
	chainId: number;
	client: {
		token: string;
		symbol: string;
		explorer: string;
	};
}

export interface IMilestone {
	index: number;
	data: { [key: string]: any };
}
