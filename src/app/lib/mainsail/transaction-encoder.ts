/* eslint-disable sonarjs/cognitive-complexity */
import { Exceptions, Networks } from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";

import { Hex, numberToHex } from "viem";
import { ContractAddresses, UnitConverter, TransactionDataEncoder } from "@arkecosystem/typescript-crypto";
import { IProfile } from "@/app/lib/profiles/contracts";
import { assertToken } from "@/utils/assertions";
import { calculateTotalAmount } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTranfer.blocks";
import { TokenDTO } from "@/app/lib/profiles/token.dto";

interface RecipientPaymentItem {
	address: string;
	alias?: string;
	amount: number;
	isValidator?: boolean;
}

export type EncodeTransactionType =
	| "transfer"
	| "multiPayment"
	| "vote"
	| "validatorRegistration"
	| "validatorResignation"
	| "usernameRegistration"
	| "usernameResignation"
	| "updateValidator"
	| "contractDeployment"
	| "approve"
	| "batchTransfer";

export interface EncodeInputData {
	bytecode?: string;
	senderAddress: string;
	recipientAddress?: string;
	recipients?: RecipientPaymentItem[];
	username?: string;
	validatorPassphrase?: string;
	voteAddresses?: string[];
	tokenContractAddress?: string;
	token?: TokenDTO;
}

interface EncodedData {
	to: (typeof ContractAddresses)[keyof typeof ContractAddresses] | string;
	data?: Hex;
}

export class TransactionEncoder {
	#network: Networks.Network;
	#profile: IProfile;

	constructor(profile: IProfile, network: Networks.Network) {
		this.#profile = profile;
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

	public updateValidator(validatorPassphrase: string): EncodedData {
		return {
			data: TransactionDataEncoder.updateValidator(validatorPassphrase),
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

	public validatorRegistration(validatorPassphrase: string): EncodedData & { value: Hex } {
		const value = this.#network.milestone()["validatorRegistrationFee"] ?? 0;

		return {
			data: TransactionDataEncoder.validatorRegistration(validatorPassphrase),
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

	public approveContract(token: TokenDTO, recipients: RecipientPaymentItem[]): EncodedData {
		const amount = BigNumber.make(calculateTotalAmount(recipients), token.decimals()).toSatoshi().toFixed(0);

		return {
			data: TransactionDataEncoder.approveContract(BigInt(amount)),
			to: token.address(),
		};
	}

	public batchTransfer(token: TokenDTO, recipients: RecipientPaymentItem[]): EncodedData {
		const amounts: bigint[] = [];
		const addresses: string[] = [];

		for (const recipient of recipients) {
			const amount = BigNumber.make(recipient.amount, token.decimals()).toSatoshi();
			addresses.push(recipient.address);
			amounts.push(BigInt(amount.toFixed(0)));
		}

		return {
			data: TransactionDataEncoder.batchTransfer(token.address(), addresses, amounts),
			to: ContractAddresses.BATCH_TRANSFER,
		};
	}

	public tokenTransfer(tokenContractAddress: string, inputData: EncodeInputData): EncodedData {
		const token = this.#profile
			.tokens()
			.selected()
			.items()
			.find((token) => token.token().address() === inputData.tokenContractAddress);

		assertToken(token);
		const recipient = inputData.recipients?.at(0);
		const amount = BigNumber.make(recipient?.amount ?? 0, token.token().decimals()).toSatoshi();

		return {
			data: TransactionDataEncoder.tokenTransfer(recipient?.address!, amount.toFixed(0)),
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
		if (type === "transfer" && !!inputData.tokenContractAddress && inputData.recipientAddress) {
			const hasToken = this.#profile
				.tokens()
				.selected()
				.items()
				.some((token) => token.token().address() === inputData.tokenContractAddress);

			if (!hasToken) {
				return this.transfer(inputData.recipientAddress);
			}

			return this.tokenTransfer(inputData.tokenContractAddress, inputData);
		}

		if (type === "transfer" && inputData.recipientAddress) {
			return this.transfer(inputData.recipientAddress);
		}

		if (type === "vote" && !!inputData.voteAddresses) {
			return this.vote(inputData.voteAddresses);
		}

		if (type === "validatorRegistration" && inputData.validatorPassphrase) {
			return this.validatorRegistration(inputData.validatorPassphrase);
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

		if (type === "updateValidator" && inputData.validatorPassphrase) {
			return this.updateValidator(inputData.validatorPassphrase);
		}

		if (type === "multiPayment" && inputData.recipients) {
			return this.multiPayment(inputData.recipients);
		}

		if (type === "approve" && inputData.token && inputData.recipients) {
			return this.approveContract(inputData.token, inputData.recipients);
		}

		if (type === "batchTransfer" && inputData.token && inputData.recipients) {
			return this.batchTransfer(inputData.token, inputData.recipients);
		}

		throw new Exceptions.Exception(
			`[TransactionEncoder#byType] Unknown transaction type: ${type} or missing input data: ${JSON.stringify(inputData)}]`,
		);
	}
}
