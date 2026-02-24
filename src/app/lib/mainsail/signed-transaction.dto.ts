import { AbiType, decodeFunctionData } from "./helpers/decode-function-data";
import { Address, TransactionTypeIdentifier, UnitConverter } from "@arkecosystem/typescript-crypto";
import { MultiPaymentItem, MultiPaymentRecipient } from "@/app/lib/mainsail/confirmed-transaction.dto.contract";
import { RawTransactionData, SignedTransactionObject } from "@/app/lib/mainsail/signed-transaction.dto.contract";

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { Hex } from "viem";
import { TokenDTO } from "@/app/lib/profiles/token.dto";

export class SignedTransactionData {
	protected identifier!: string;
	protected signedData!: RawTransactionData;
	protected serialized!: string;

	readonly #types = [
		{ method: "isMultiPayment", type: "multiPayment" },
		{ method: "isTransfer", type: "transfer" },
		{ method: "isUsernameRegistration", type: "usernameRegistration" },
		{ method: "isUsernameResignation", type: "usernameResignation" },
		{ method: "isUnvote", type: "unvote" },
		{ method: "isValidatorRegistration", type: "validatorRegistration" },
		{ method: "isValidatorResignation", type: "validatorResignation" },
		{ method: "isVote", type: "vote" },
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
		return gasPrice.times(this.signedData.gasLimit);
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
		return TransactionTypeIdentifier.isTransfer(this.signedData.data);
	}

	public isUsernameRegistration(): boolean {
		return TransactionTypeIdentifier.isUsernameRegistration(this.signedData.data);
	}

	public isUsernameResignation(): boolean {
		return TransactionTypeIdentifier.isUsernameResignation(this.signedData.data);
	}

	public isValidatorRegistration(): boolean {
		return TransactionTypeIdentifier.isValidatorRegistration(this.signedData.data);
	}

	public isUpdateValidator(): boolean {
		return TransactionTypeIdentifier.isUpdateValidator(this.signedData.data);
	}

	public isVote(): boolean {
		return TransactionTypeIdentifier.isVote(this.signedData.data);
	}

	public isUnvote(): boolean {
		return TransactionTypeIdentifier.isUnvote(this.signedData.data);
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
		return TransactionTypeIdentifier.isMultiPayment(this.signedData.data);
	}

	public isValidatorResignation(): boolean {
		return TransactionTypeIdentifier.isValidatorResignation(this.signedData.data);
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

	public token(): TokenDTO | undefined {
		if (this.isTokenTransfer() && this.data().token) {
			return new TokenDTO(this.data().token);
		}
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
		if (this.isTokenTransfer()) {
			return "transfer";
		}

		for (const { type, method } of this.#types) {
			if (this[method]()) {
				return type;
			}
		}

		return this.methodHash();
	}

	public gasLimit(): number {
		return this.signedData.gasLimit;
	}

	public gasUsed(): number {
		return BigNumber.make(UnitConverter.formatUnits(this.signedData.gasPrice, "gwei")).toNumber();
	}

	public isTokenTransfer(): boolean {
		return TransactionTypeIdentifier.isTokenTransfer(this.signedData.data);
	}

	public isContractTransaction(): boolean {
		return [
			this.isValidatorRegistration(),
			this.isValidatorResignation(),
			this.isVote(),
			this.isUnvote(),
			this.isUsernameRegistration(),
			this.isUsernameResignation(),
		].some(Boolean);
	}

	public isContractDeployment() {
		return [!this.isContractTransaction(), !this.to()].every(Boolean);
	}

	public isApprove(): boolean {
		return TransactionTypeIdentifier.isApprove(this.signedData.data);
	}

	public isRevoke(): boolean {
		return TransactionTypeIdentifier.isRevoke(this.signedData.data);
	}

	public isBatchTransfer(): boolean {
		return TransactionTypeIdentifier.isBatchTransfer(this.signedData.data);
	}
}
