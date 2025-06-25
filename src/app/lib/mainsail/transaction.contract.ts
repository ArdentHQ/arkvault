import { Signatory } from "./signatories";
import { SignedTransactionData } from "./contracts";
import { BigNumber } from "@/app/lib/helpers";

export interface TransactionService {
	// Core
	transfer(input: TransferInput): Promise<SignedTransactionData>;
	secondSignature(input: SecondSignatureInput): Promise<SignedTransactionData>;
	validatorRegistration(input: ValidatorRegistrationInput): Promise<SignedTransactionData>;
	usernameRegistration(input: UsernameRegistrationInput): Promise<SignedTransactionData>;
	usernameResignation(input: UsernameResignationInput): Promise<SignedTransactionData>;
	vote(input: VoteInput): Promise<SignedTransactionData>;
	multiPayment(input: MultiPaymentInput): Promise<SignedTransactionData>;
	validatorResignation(input: ValidatorResignationInput): Promise<SignedTransactionData>;

	// Estimations
	estimateExpiration(value?: string): Promise<string | undefined>;
}

// Transaction Signing
export interface TransactionInput {
	fee?: number;
	feeLimit?: number;
	gasPrice?: BigNumber;
	gasLimit?: BigNumber;
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

export interface ValidatorRegistrationInput extends TransactionInput {
	data: { validatorPublicKey: string; value: number };
}

export interface VoteInput extends TransactionInput {
	data: {
		votes: { id: string; amount: number }[];
		unvotes: { id: string; amount: number }[];
	};
}

export interface MultiPaymentInput extends TransactionInput {
	data: {
		memo?: string;
		payments: { to: string; amount: number }[];
	};
}

export type ValidatorResignationInput = TransactionInput;

export type UpdateValidatorInput = TransactionInput;

export type TransactionInputs = Record<string, any> & {
	signatory: Signatory;
};
