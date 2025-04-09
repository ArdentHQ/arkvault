import { Signatory } from "./signatories";
import { SignedTransactionData } from "./contracts";
import { UnlockableBalance } from "./client.contract";

export interface TransactionService {
	// Core
	transfer(input: TransferInput): Promise<SignedTransactionData>;
	secondSignature(input: SecondSignatureInput): Promise<SignedTransactionData>;
	delegateRegistration(input: DelegateRegistrationInput): Promise<SignedTransactionData>;
	validatorRegistration(input: ValidatorRegistrationInput): Promise<SignedTransactionData>;
	usernameRegistration(input: UsernameRegistrationInput): Promise<SignedTransactionData>;
	usernameResignation(input: UsernameResignationInput): Promise<SignedTransactionData>;
	vote(input: VoteInput): Promise<SignedTransactionData>;
	multiSignature(input: MultiSignatureInput): Promise<SignedTransactionData>;
	ipfs(input: IpfsInput): Promise<SignedTransactionData>;
	multiPayment(input: MultiPaymentInput): Promise<SignedTransactionData>;
	delegateResignation(input: DelegateResignationInput): Promise<SignedTransactionData>;
	validatorResignation(input: ValidatorResignationInput): Promise<SignedTransactionData>;
	unlockToken(input: UnlockTokenInput): Promise<SignedTransactionData>;

	// Estimations
	estimateExpiration(value?: string): Promise<string | undefined>;
}

// Transaction Signing
export interface TransactionInput {
	fee?: number;
	feeLimit?: number;
	gasPrice?: number;
	gasLimit?: number;
	nonce?: string;
	signatory: Signatory;
	contract?: {
		address: string;
	};
}

export interface TransferInput extends TransactionInput {
	data: {
		amount: number;
		to: string;
		memo?: string;
		expiration?: number;
	};
}

export interface SecondSignatureInput extends TransactionInput {
	data: { mnemonic: string };
}

export interface UsernameRegistrationInput extends TransactionInput {
	data: { username: string };
}

export declare type UsernameResignationInput = TransactionInput;

export interface DelegateRegistrationInput extends TransactionInput {
	data: { username: string };
}

export interface ValidatorRegistrationInput extends TransactionInput {
	data: { validatorPublicKey: string };
}

export interface VoteInput extends TransactionInput {
	data: {
		votes: { id: string; amount: number }[];
		unvotes: { id: string; amount: number }[];
	};
}

export type MusigDerivationMethod = "legacyMusig" | "p2SHSegwitMusig" | "nativeSegwitMusig";

export interface MultiSignatureInput extends TransactionInput {
	data: {
		// Standard
		lifetime?: number;
		min?: number;
		publicKeys?: string[];
		senderPublicKey?: string;
		// Advanced
		mandatoryKeys?: string[];
		numberOfSignatures?: number;
		optionalKeys?: string[];
		derivationMethod?: MusigDerivationMethod;
	};
}

export interface IpfsInput extends TransactionInput {
	data: { hash: string };
}

export interface MultiPaymentInput extends TransactionInput {
	data: {
		memo?: string;
		payments: { to: string; amount: number }[];
	};
}

export type DelegateResignationInput = TransactionInput;
export type ValidatorResignationInput = TransactionInput;

export interface UnlockTokenInput extends TransactionInput {
	data: {
		objects: UnlockableBalance[];
	};
}

export type TransactionInputs = Record<string, any> & {
	signatory: Signatory;
};
