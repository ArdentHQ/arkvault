import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";

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

	nonce(): BigNumber;

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

	isValidatorRegistration(): boolean;

	isVoteCombination(): boolean;

	isVote(): boolean;

	isUnvote(): boolean;

	isMultiPayment(): boolean;

	isValidatorResignation(): boolean;

	// Second-Signature Registration
	secondPublicKey(): string;

	username(): string;

	validatorPublicKey(): string;

	// Vote
	votes(): string[];

	unvotes(): string[];

	// Multi-Signature Registration
	publicKeys(): string[];

	min(): number;

	// Multi-Payment
	payments(): MultiPaymentItem[];

	methodHash(): string;

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
