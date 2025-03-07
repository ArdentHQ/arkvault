import { BigNumber } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";

export interface MultiPaymentRecipient {
	address: string;
	amount: BigNumber;
}

export interface MultiPaymentItem {
	recipientId: string;
	amount: BigNumber;
}

// These types and interfaces are responsible for transaction-specific methods.
export type TransactionDataMeta = string | number | boolean | undefined;

export interface UnspentTransactionData {
	id(): string;

	timestamp(): DateTime;

	amount(): BigNumber;

	address(): string;
}

export interface ConfirmedTransactionData {
	configure(data: any): ConfirmedTransactionData;

	withDecimals(decimals?: number | string): ConfirmedTransactionData;

	id(): string;

	blockId(): string | undefined;

	type(): string;

	timestamp(): DateTime | undefined;

	confirmations(): BigNumber;

	sender(): string;

	senders(): MultiPaymentRecipient[];

	recipient(): string;

	recipients(): MultiPaymentRecipient[];

	amount(): BigNumber;

	fee(): BigNumber;

	memo(): string | undefined;

	nonce(): BigNumber;

	asset(): Record<string, unknown>;

	inputs(): UnspentTransactionData[];

	outputs(): UnspentTransactionData[];

	isConfirmed(): boolean;

	isReturn(): boolean;

	isSent(): boolean;

	isReceived(): boolean;

	isTransfer(): boolean;

	isSecondSignature(): boolean;

	isUsernameRegistration(): boolean;

	isUsernameResignation(): boolean;

	isDelegateRegistration(): boolean;

	isValidatorRegistration(): boolean;

	isVoteCombination(): boolean;

	isVote(): boolean;

	isUnvote(): boolean;

	isMultiSignatureRegistration(): boolean;

	isIpfs(): boolean;

	isMultiPayment(): boolean;

	isDelegateResignation(): boolean;

	isValidatorResignation(): boolean;

	isHtlcLock(): boolean;

	isHtlcClaim(): boolean;

	isHtlcRefund(): boolean;

	isMagistrate(): boolean;

	isUnlockToken(): boolean;

	// Second-Signature Registration
	secondPublicKey(): string;

	// Delegate Registration
	username(): string;

	validatorPublicKey(): string;

	// Vote
	votes(): string[];

	unvotes(): string[];

	// Multi-Signature Registration
	publicKeys(): string[];

	min(): number;

	// IPFS
	hash(): string;

	// Multi-Payment
	payments(): MultiPaymentItem[];

	methodHash(): string;

	// HTLC Claim / Refund
	lockTransactionId(): string;

	// HTLC Claim
	unlockSecret(): string;

	// HTLC Lock
	secretHash(): string;

	expirationType(): number;

	expirationValue(): number;

	toObject(): Record<string, any>;

	toJSON(): Record<string, any>;

	toHuman(): Record<string, any>;

	hasPassed(): boolean;

	hasFailed(): boolean;

	getMeta(key: string): TransactionDataMeta;

	setMeta(key: string, value: TransactionDataMeta): void;

	normalizeData(): Promise<void>;

	isSuccess(): boolean;
}

export type ConfirmedTransactionDataCollection = ConfirmedTransactionData[];
