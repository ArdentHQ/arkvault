import { MultiPaymentItem, MultiPaymentRecipient } from "@/app/lib/mainsail/confirmed-transaction.dto.contract";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { Hex } from "viem";

import { AbiType, decodeFunctionData } from "./helpers/decode-function-data";
import { TransactionTypeService } from "./transaction-type.service";
import { RawTransactionData, SignedTransactionObject } from "@/app/lib/mainsail/signed-transaction.dto.contract";
import { Address, UnitConverter } from "@arkecosystem/typescript-crypto";

export class SignedTransactionData {
	protected identifier!: string;
	protected signedData!: RawTransactionData;
	protected serialized!: string;

	readonly #types = [
		{ method: "isMultiPayment", type: "multiPayment" },
		{ method: "isSecondSignature", type: "secondSignature" },
		{ method: "isTransfer", type: "transfer" },
		{ method: "isUsernameRegistration", type: "usernameRegistration" },
		{ method: "isUsernameResignation", type: "usernameResignation" },
		{ method: "isUnvote", type: "unvote" },
		{ method: "isValidatorRegistration", type: "validatorRegistration" },
		{ method: "isValidatorResignation", type: "validatorResignation" },
		{ method: "isVote", type: "vote" },
		{ method: "isVoteCombination", type: "voteCombination" },
		{ method: "isUpdateValidator", type: "updateValidator" },
	];

	public configure(signedData: RawTransactionData, serialized: string) {
		this.identifier = signedData.hash;
		this.signedData = signedData;
		this.serialized = serialized;

		if (!this.signedData.from) {
			this.signedData.from = Address.fromPublicKey(signedData.senderPublicKey);
		}

		return this;
	}

	public usesMultiSignature(): boolean {
		return false;
	}

	public memo(): string {
		return this.signedData.memo;
	}

	public recipients(): MultiPaymentRecipient[] {
		if (this.isMultiPayment()) {
			return this.payments().map((payment: { recipientId: string; amount: BigNumber }) => ({
				address: payment.recipientId,
				amount: BigNumber.make(payment.amount),
			}));
		}

		return [
			{
				address: this.to(),
				amount: this.value(),
			},
		];
	}

	public hash(): string {
		return this.identifier;
	}

	public from(): string {
		return this.signedData.from;
	}

	public nonce(): BigNumber {
		return this.signedData.nonce;
	}

	public to(): string {
		return this.signedData.to;
	}

	public value(): BigNumber {
		if (this.isMultiPayment()) {
			return BigNumber.sum(this.payments().map(({ amount }) => amount));
		}

		return BigNumber.make(UnitConverter.formatUnits(this.signedData.value, "ark"));
	}

	public fee(): BigNumber {
		const gasPrice = BigNumber.make(UnitConverter.formatUnits(this.signedData.gasPrice, "ark"));
		return gasPrice.times(this.signedData.gas);
	}

	public timestamp(): DateTime {
		if (this.signedData.timestamp) {
			return DateTime.make(this.signedData.timestamp);
		}

		return DateTime.make();
	}

	// Vote
	public votes(): string[] {
		let data = this.signedData.data as string;

		if (!data.startsWith("0x")) {
			data = `0x${data}`;
		}

		const voteAddress = decodeFunctionData(data as Hex).args[0] as string;
		return [voteAddress];
	}

	public unvotes(): string[] {
		return [];
	}

	public isTransfer(): boolean {
		return TransactionTypeService.isTransfer(this.signedData);
	}

	public isSecondSignature(): boolean {
		return false;
	}

	public isUsernameRegistration(): boolean {
		return TransactionTypeService.isUsernameRegistration(this.signedData);
	}

	public isUsernameResignation(): boolean {
		return TransactionTypeService.isUsernameResignation(this.signedData);
	}

	public isValidatorRegistration(): boolean {
		return TransactionTypeService.isValidatorRegistration(this.signedData);
	}

	public isUpdateValidator(): boolean {
		return TransactionTypeService.isUpdateValidator(this.signedData);
	}

	public isVoteCombination(): boolean {
		return TransactionTypeService.isVoteCombination(this.signedData);
	}

	public isVote(): boolean {
		return TransactionTypeService.isVote(this.signedData);
	}

	public isUnvote(): boolean {
		return TransactionTypeService.isUnvote(this.signedData);
	}

	// Multi-Payment
	public payments(): MultiPaymentItem[] {
		const payments: MultiPaymentItem[] = [];

		const [recipients, amounts] = decodeFunctionData(this.normalizedData() as Hex, AbiType.MultiPayment).args;

		for (const index in recipients) {
			payments[index] = {
				amount: BigNumber.make(UnitConverter.formatUnits(amounts[index], "ark")),
				recipientId: recipients[index],
			};
		}

		return payments;
	}

	public username(): string {
		return decodeFunctionData(this.normalizedData() as Hex, AbiType.Username).args[0] as string;
	}

	public validatorPublicKey(): string {
		const key = decodeFunctionData(this.normalizedData() as Hex).args[0] as string;
		return key.slice(2); // removes 0x part
	}

	public isMultiPayment(): boolean {
		return TransactionTypeService.isMultiPayment(this.signedData);
	}

	public isValidatorResignation(): boolean {
		return TransactionTypeService.isValidatorResignation(this.signedData);
	}

	public methodHash(): string {
		// Signed transactions do not have data prefixed with `0x`
		// that is why we are using first 8 chars to extract method.
		const methodName = this.signedData.data.slice(0, 8);

		return `0x${methodName}`;
	}

	public toBroadcast() {
		return this.serialized;
	}

	private normalizedData() {
		let data = this.signedData.data as string;

		if (!data.startsWith("0x")) {
			data = `0x${data}`;
		}

		return data;
	}

	public toString(): string {
		if (typeof this.signedData === "string") {
			return this.signedData;
		}

		return JSON.stringify(this.signedData);
	}

	public get<T = string>(key: string): T {
		return this.signedData[key];
	}

	public data(): RawTransactionData {
		return this.signedData;
	}

	public toObject(): SignedTransactionObject {
		return {
			broadcast: this.toBroadcast(),
			data: this.data(),
			fee: this.fee().toFixed(0),
			from: this.from(),
			hash: this.hash(),
			timestamp: this.timestamp().toISOString(),
			to: this.to(),
			value: this.value().toFixed(0),
		};
	}

	protected normalizeTransactionData<T>(value: RawTransactionData): T {
		return JSON.parse(
			JSON.stringify(value, (key, value) => {
				if (typeof value === "bigint") {
					return value.toString();
				}

				if (["timestamp"].includes(key)) {
					return DateTime.make(value).toUNIX();
				}

				if (["amount", "nonce", "fee"].includes(key)) {
					return value.toString();
				}

				if (value instanceof Map) {
					return Object.fromEntries(value);
				}

				return value;
			}),
		);
	}

	public toSignedData(): any {
		return this.normalizeTransactionData(this.signedData);
	}

	public type(): string {
		if (this.isVoteCombination()) {
			return "voteCombination";
		}

		for (const { type, method } of this.#types) {
			if (type === "voteCombination") {
				continue;
			}

			if (this[method]()) {
				return type;
			}
		}

		return this.methodHash();
	}
}
