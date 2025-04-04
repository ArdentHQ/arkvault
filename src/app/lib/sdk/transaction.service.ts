/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { BigNumber, NumberLike } from "@/app/lib/helpers";
import {
	TransactionService as Contract,
	DelegateRegistrationInput,
	DelegateResignationInput,
	IpfsInput,
	MultiPaymentInput,
	MultiSignatureInput,
	SecondSignatureInput,
	TransferInput,
	UnlockTokenInput,
	UsernameRegistrationInput,
	UsernameResignationInput,
	ValidatorRegistrationInput,
	VoteInput,
	ValidatorResignationInput,
} from "./transaction.contract";

import { BigNumberService } from "./big-number.service";
import { BindingType } from "./service-provider.contract";
import { ClientService } from "./client.contract";
import { ConfigRepository } from "./coins";
import { DataTransferObjectService } from "./data-transfer-object.contract";
import { HttpClient } from "./http";
import { IContainer } from "./container.contracts";
import { NetworkHostSelector } from "./network.models";
import { NotImplemented } from "./exceptions";
import { SignedTransactionData } from "./contracts";

export class AbstractTransactionService implements Contract {
	protected readonly bigNumberService: BigNumberService;
	protected readonly clientService: ClientService;
	protected readonly configRepository: ConfigRepository;
	protected readonly dataTransferObjectService: DataTransferObjectService;
	protected readonly httpClient: HttpClient;
	protected readonly hostSelector: NetworkHostSelector;

	public constructor(container: IContainer) {
		this.bigNumberService = container.get(BindingType.BigNumberService);
		this.clientService = container.get(BindingType.ClientService);
		this.configRepository = container.get(BindingType.ConfigRepository);
		this.dataTransferObjectService = container.get(BindingType.DataTransferObjectService);
		this.httpClient = container.get(BindingType.HttpClient);
		this.hostSelector = container.get(BindingType.NetworkHostSelector);
	}

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

	public async delegateRegistration(
		input: DelegateRegistrationInput | ValidatorRegistrationInput,
	): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.delegateRegistration.name);
	}

	public async validatorRegistration(input: ValidatorRegistrationInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.validatorRegistration.name);
	}

	public async vote(input: VoteInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.vote.name);
	}

	public async multiSignature(input: MultiSignatureInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.multiSignature.name);
	}

	public async ipfs(input: IpfsInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.ipfs.name);
	}

	public async multiPayment(input: MultiPaymentInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.multiPayment.name);
	}

	public async delegateResignation(input: DelegateResignationInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.delegateResignation.name);
	}

	public async validatorResignation(input: ValidatorResignationInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.validatorResignation.name);
	}

	public async unlockToken(input: UnlockTokenInput): Promise<SignedTransactionData> {
		throw new NotImplemented(this.constructor.name, this.unlockToken.name);
	}

	public async estimateExpiration(value?: string): Promise<string | undefined> {
		return undefined;
	}

	protected toSatoshi(value: NumberLike): BigNumber {
		return this.bigNumberService.make(value).toSatoshi();
	}
}
