import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";

import { MultiPaymentItem, MultiPaymentRecipient } from "./confirmed-transaction.dto.contract";

export type RawTransactionData = any;

export interface SignedTransactionObject {
	hash: string;
	from: string;
	to: string;
	value: string;
	fee: string;
	timestamp: string;
	data: RawTransactionData;
	broadcast: any;
}

export interface SignedTransactionData {
	setAttributes(attributes: { identifier: string }): void;

	configure(identifier: string, signedData: RawTransactionData, serialized?: string, decimals?: number | string);

	// All
	hash(): string;
	data(): RawTransactionData;
	from(): string;
	to(): string;
	value(): BigNumber;
	fee(): BigNumber;
	nonce(): BigNumber;
	timestamp(): DateTime;
	memo(): string;

	// Types
	isTransfer(): boolean;
	isSecondSignature(): boolean;
	isValidatorRegistration(): boolean;
	isUsernameRegistration(): boolean;
	isUsernameResignation(): boolean;
	isValidatorResignation(): boolean;
	isVoteCombination(): boolean;
	isVote(): boolean;
	isUnvote(): boolean;
	isMultiPayment(): boolean;

	methodHash(): string;
	usesMultiSignature(): boolean;
	isMultiSignatureRegistration(): boolean;

	// Access & serialization
	get<T = string>(key: string): T;
	toString(): string;
	toBroadcast(): any;
	toSignedData(): any;
	toObject(): SignedTransactionObject;
	type(): string;

	votes(): string[];
	unvotes(): string[];

	// Multi-Payment
	payments(): MultiPaymentItem[];

	username(): string;
	validatorPublicKey(): string;
	recipients(): MultiPaymentRecipient[];

	gasLimit(): number;
	gasUsed(): number;
}
