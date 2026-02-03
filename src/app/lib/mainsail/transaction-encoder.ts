/* eslint-disable sonarjs/cognitive-complexity */
import { Exceptions, Networks } from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";

import { Hex, numberToHex } from "viem";
import { ContractAddresses, UnitConverter, TransactionDataEncoder } from "@arkecosystem/typescript-crypto";

interface RecipientPaymentItem {
	address: string;
	alias?: string;
	amount: number;
	isValidator?: boolean;
}

export type EncodeTransactionType =
	| "transfer"
	| "multiPayment"
	| "multiSignature"
	| "vote"
	| "validatorRegistration"
	| "validatorResignation"
	| "usernameRegistration"
	| "usernameResignation"
	| "updateValidator"
	| "contractDeployment";

export interface EncodeInputData {
	bytecode?: string;
	senderAddress: string;
	recipientAddress?: string;
	recipients?: RecipientPaymentItem[];
	username?: string;
	validatorPublicKey?: string;
	voteAddresses?: string[];
	tokenContractAddress?: string;
	tokenContractDecimals?: number;
}

interface EncodedData {
	to: (typeof ContractAddresses)[keyof typeof ContractAddresses] | string;
	data?: Hex;
}

export class TransactionEncoder {
	#network: Networks.Network;

	constructor(network: Networks.Network) {
		this.#network = network;
	}

	public multiPayment(recipientList: RecipientPaymentItem[]): EncodedData & { value: Hex } {
		const recipients: string[] = [];
		const amounts: string[] = [];

		for (const payment of recipientList) {
			recipients.push(payment.address);
			amounts.push(UnitConverter.parseUnits(payment.amount, "ark").toString());
		}

		const value = numberToHex(BigNumber.sum(amounts).toBigInt());

		return {
			data: TransactionDataEncoder.multiPayment(recipients, amounts),
			to: ContractAddresses.MULTIPAYMENT,
			value,
		};
	}

	public transfer(to: string): EncodedData {
		return {
			data: undefined,
			to,
		};
	}

	public updateValidator(validatorPublicKey: string): EncodedData {
		return {
			data: TransactionDataEncoder.updateValidator(validatorPublicKey),
			to: ContractAddresses.CONSENSUS,
		};
	}

	public usernameRegistration(username: string): EncodedData {
		return {
			data: TransactionDataEncoder.usernameRegistration(username),
			to: ContractAddresses.USERNAMES,
		};
	}

	public usernameResignation(): EncodedData {
		return {
			data: TransactionDataEncoder.usernameResignation(),
			to: ContractAddresses.USERNAMES,
		};
	}

	public validatorRegistration(validatorPublicKey: string): EncodedData & { value: Hex } {
		const value = this.#network.milestone()["validatorRegistrationFee"] ?? 0;

		return {
			data: TransactionDataEncoder.validatorRegistration(validatorPublicKey),
			to: ContractAddresses.CONSENSUS,
			value: numberToHex(BigNumber.make(value).toBigInt()),
		};
	}

	public validatorResignation(): EncodedData {
		return {
			data: TransactionDataEncoder.validatorResignation(),
			to: ContractAddresses.CONSENSUS,
		};
	}

	public contractDeployment(bytecode: Hex): EncodedData {
		return {
			data: bytecode,
			to: "",
		};
	}

	public tokenTransfer(tokenContractAddress: string, inputData: EncodeInputData): EncodedData {
		const recipient = inputData.recipients?.at(0);
		const amount = BigNumber.make(recipient?.amount ?? 0, inputData.tokenContractDecimals).toSatoshi();

		return {
			data: TransactionDataEncoder.tokenTransfer(recipient?.address!, amount.toString()),
			to: tokenContractAddress,
		};
	}

	public vote(voteAddresses: string[]): EncodedData {
		const vote = voteAddresses.at(0);
		const isVote = !!vote;

		if (isVote) {
			return {
				data: TransactionDataEncoder.vote(vote),
				to: ContractAddresses.CONSENSUS,
			};
		}

		return {
			data: TransactionDataEncoder.unvote(),
			to: ContractAddresses.CONSENSUS,
		};
	}

	byType(inputData: EncodeInputData, type: EncodeTransactionType): EncodedData {
		if (type === "transfer" && !!inputData.tokenContractAddress) {
			return this.tokenTransfer(inputData.tokenContractAddress, inputData);
		}

		if (type === "transfer" && inputData.recipientAddress) {
			return this.transfer(inputData.recipientAddress);
		}

		if (type === "vote" && !!inputData.voteAddresses) {
			return this.vote(inputData.voteAddresses);
		}

		if (type === "validatorRegistration" && inputData.validatorPublicKey) {
			return this.validatorRegistration(inputData.validatorPublicKey);
		}

		if (type === "validatorResignation") {
			return this.validatorResignation();
		}

		if (type === "usernameRegistration" && inputData.username) {
			return this.usernameRegistration(inputData.username);
		}

		if (type === "usernameResignation") {
			return this.usernameResignation();
		}

		if (type === "contractDeployment") {
			return this.contractDeployment(inputData.bytecode as Hex);
		}

		if (type === "updateValidator" && inputData.validatorPublicKey) {
			return this.updateValidator(inputData.validatorPublicKey);
		}

		if (type === "multiPayment" && inputData.recipients) {
			return this.multiPayment(inputData.recipients);
		}

		throw new Exceptions.Exception(
			`[TransactionEncoder#byType] Unknown transaction type: ${type} or missing input data: ${JSON.stringify(inputData)}]`,
		);
	}
}
