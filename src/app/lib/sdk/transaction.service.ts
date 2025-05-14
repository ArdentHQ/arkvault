/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { BigNumber, NumberLike } from "@/app/lib/helpers";
import {
	TransactionService as Contract,
	MultiPaymentInput,
	SecondSignatureInput,
	TransferInput,
	UsernameRegistrationInput,
	UsernameResignationInput,
	ValidatorRegistrationInput,
	VoteInput,
	ValidatorResignationInput,
} from "./transaction.contract";

import { NotImplemented } from "./exceptions";
import { SignedTransactionData } from "./contracts";

export class AbstractTransactionService implements Contract {
	public async transfer(input: TransferInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.transfer.name);
	}

	public async secondSignature(input: SecondSignatureInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.secondSignature.name);
	}

	public async usernameRegistration(input: UsernameRegistrationInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.usernameRegistration.name);
	}

	public async usernameResignation(input: UsernameResignationInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.usernameResignation.name);
	}

	public async validatorRegistration(input: ValidatorRegistrationInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.validatorRegistration.name);
	}

	public async vote(input: VoteInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.vote.name);
	}

	public async multiPayment(input: MultiPaymentInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.multiPayment.name);
	}

	public async validatorResignation(input: ValidatorResignationInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.validatorResignation.name);
	}

	public async estimateExpiration(value?: string): Promise<string | undefined> {
		return undefined;
	}
}
