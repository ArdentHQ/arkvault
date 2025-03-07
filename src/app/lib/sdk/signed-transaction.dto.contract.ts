import { BigNumber } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";

import { MultiPaymentItem, MultiPaymentRecipient } from "./confirmed-transaction.dto.contract";

export type RawTransactionData = any;

export interface SignedTransactionObject {
	id: string;
	sender: string;
	recipient: string;
	amount: string;
	fee: string;
	timestamp: string;
	data: RawTransactionData;
	broadcast: any;
}

export interface SignedTransactionData {
	setAttributes(attributes: { identifier: string }): void;

	configure(identifier: string, signedData: RawTransactionData, broadcastData?: any, decimals?: number | string);

	// All
	id(): string;
	data(): RawTransactionData;
	sender(): string;
	recipient(): string;
	amount(): BigNumber;
	fee(): BigNumber;
	memo(): string | undefined;
	nonce(): BigNumber;
	timestamp(): DateTime;

	// Types
	isTransfer(): boolean;
	isSecondSignature(): boolean;
	isDelegateRegistration(): boolean;
	isValidatorRegistration(): boolean;
	isUsernameRegistration(): boolean;
	isUsernameResignation(): boolean;
	isValidatorResignation(): boolean;
	isVoteCombination(): boolean;
	isVote(): boolean;
	isUnvote(): boolean;
	isMultiSignatureRegistration(): boolean;
	isIpfs(): boolean;
	isMultiPayment(): boolean;
	isDelegateResignation(): boolean;
	isHtlcLock(): boolean;
	isHtlcClaim(): boolean;
	isHtlcRefund(): boolean;
	isMagistrate(): boolean;
	isUnlockToken(): boolean;

	methodHash(): string;

	// Indicates if the transaction has been signed with a multi-signature.
	usesMultiSignature(): boolean;

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

	// @TODO: remove those after introducing proper signed tx DTOs
	username(): string;
	validatorPublicKey(): string;
	hash(): string;
	recipients(): MultiPaymentRecipient[];
	sanitizeSignatures(): Promise<void>;
}
