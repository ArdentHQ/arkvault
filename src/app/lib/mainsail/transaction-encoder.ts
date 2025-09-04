import { Exceptions, Networks } from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";

import { ConsensusAbi, MultiPaymentAbi, UsernamesAbi } from "@mainsail/evm-contracts";
import { encodeFunctionData, EncodeFunctionDataReturnType, Hex, numberToHex } from "viem";
import { ContractAddresses, UnitConverter } from "@arkecosystem/typescript-crypto";

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
	| "updateValidator";

export interface EncodeInputData {
	senderAddress: string;
	recipientAddress?: string;
	recipients?: RecipientPaymentItem[];
	username?: string;
	validatorPublicKey?: string;
	voteAddresses?: string[];
}

interface EncodedData {
	to: (typeof ContractAddresses)[keyof typeof ContractAddresses] | string;
	data?: EncodeFunctionDataReturnType;
}

export class TransactionEncoder {
	#network: Networks.Network;

	constructor(network: Networks.Network) {
		this.#network = network;
	}

	public multiPayment(recipientList: RecipientPaymentItem[]): EncodedData & { value: Hex } {
		const recipients: string[] = [];
		const amounts: BigNumber[] = [];

		for (const payment of recipientList) {
			recipients.push(payment.address);
			// @TODO https://app.clickup.com/t/86dwvx1ya get rid of extra BigNumber.make
			amounts.push(BigNumber.make(UnitConverter.parseUnits(payment.amount, "ark").toString()));
		}

		const value = numberToHex(BigNumber.sum(amounts).toBigInt());

		const data = encodeFunctionData({
			abi: MultiPaymentAbi.abi,
			args: [recipients, amounts],
			functionName: "pay",
		});

		return {
			data,
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
		const data = encodeFunctionData({
			abi: ConsensusAbi.abi,
			args: [`0x${validatorPublicKey}`],
			functionName: "updateValidator",
		});

		return {
			data,
			to: ContractAddresses.CONSENSUS,
		};
	}

	public usernameRegistration(username: string): EncodedData {
		const data = encodeFunctionData({
			abi: UsernamesAbi.abi,
			args: [username],
			functionName: "registerUsername",
		});

		return {
			data,
			to: ContractAddresses.USERNAMES,
		};
	}

	public usernameResignation(): EncodedData {
		const data = encodeFunctionData({
			abi: UsernamesAbi.abi,
			args: [],
			functionName: "resignUsername",
		});

		return {
			data,
			to: ContractAddresses.USERNAMES,
		};
	}

	public validatorRegistration(validatorPublicKey: string): EncodedData & { value: Hex } {
		const data = encodeFunctionData({
			abi: ConsensusAbi.abi,
			args: [`0x${validatorPublicKey}`],
			functionName: "registerValidator",
		});

		const value = this.#network.milestone()["validatorRegistrationFee"] ?? 0;

		return {
			data,
			to: ContractAddresses.CONSENSUS,
			value: numberToHex(BigNumber.make(value).toBigInt()),
		};
	}

	public validatorResignation(): EncodedData {
		const data = encodeFunctionData({
			abi: ConsensusAbi.abi,
			args: [],
			functionName: "resignValidator",
		});

		return {
			data,
			to: ContractAddresses.CONSENSUS,
		};
	}

	public vote(voteAddresses: string[]): EncodedData {
		const vote = voteAddresses.at(0);
		const isVote = !!vote;

		const data = encodeFunctionData({
			abi: ConsensusAbi.abi,
			args: isVote ? [vote] : [],
			functionName: isVote ? "vote" : "unvote",
		});

		return {
			data,
			to: ContractAddresses.CONSENSUS,
		};
	}

	byType(inputData: EncodeInputData, type: EncodeTransactionType): EncodedData {
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
