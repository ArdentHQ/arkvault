/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { strict as assert } from "assert";

import { MultiPaymentItem, MultiPaymentRecipient } from "./confirmed-transaction.dto.contract";
import { RawTransactionData, SignedTransactionData } from "./contracts";
import { NotImplemented } from "./exceptions";
import { SignedTransactionObject } from "./signed-transaction.dto.contract";

export class AbstractSignedTransactionData implements SignedTransactionData {
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
	];

	public configure(identifier: string, signedData: RawTransactionData, serialized: string) {
		assert.ok(signedData);

		this.identifier = identifier;
		this.serialized = serialized;
		this.signedData = signedData;

		return this;
	}

	public setAttributes(attributes: { identifier: string }): void {
		this.identifier = attributes.identifier;
	}

	public hash(): string {
		return this.identifier;
	}

	public memo(): string {
		return this.signedData.memo;
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

	public data(): RawTransactionData {
		return this.signedData;
	}

	public from(): string {
		throw new NotImplemented(this.constructor.name, this.from.name);
	}

	public to(): string {
		throw new NotImplemented(this.constructor.name, this.to.name);
	}

	public value(): BigNumber {
		throw new NotImplemented(this.constructor.name, this.value.name);
	}

	public fee(): BigNumber {
		return BigNumber.ZERO;
	}

	public nonce(): BigNumber {
		throw new NotImplemented(this.constructor.name, this.nonce.name);
	}

	public timestamp(): DateTime {
		throw new NotImplemented(this.constructor.name, this.timestamp.name);
	}

	public isTransfer(): boolean {
		return true;
	}

	public isSecondSignature(): boolean {
		return false;
	}

	public isUsernameRegistration(): boolean {
		return false;
	}

	public isUsernameResignation(): boolean {
		return false;
	}

	public isValidatorRegistration(): boolean {
		return false;
	}

	public isVoteCombination(): boolean {
		return false;
	}

	public isVote(): boolean {
		return false;
	}

	public isUnvote(): boolean {
		return false;
	}

	public isIpfs(): boolean {
		return false;
	}

	public isMultiPayment(): boolean {
		return false;
	}

	public isValidatorResignation(): boolean {
		return false;
	}

	public methodHash(): string {
		return "transfer";
	}

	public get<T = string>(key: string): T {
		return this.signedData[key];
	}

	public toString(): string {
		if (typeof this.signedData === "string") {
			return this.signedData;
		}

		return JSON.stringify(this.signedData);
	}

	public toBroadcast(): any {
		throw new NotImplemented(this.constructor.name, this.toBroadcast.name);
	}

	public usesMultiSignature(): boolean {
		return false;
	}

	public isMultiSignatureRegistration(): boolean {
		return false;
	}

	public toSignedData(): any {
		return this.normalizeTransactionData(this.signedData);
	}

	public toObject(): SignedTransactionObject {
		return {
			value: this.value().toFixed(0),
			broadcast: this.toBroadcast(),
			data: this.data(),
			fee: this.fee().toFixed(0),
			hash: this.hash(),
			to: this.to(),
			from: this.from(),
			timestamp: this.timestamp().toISOString(),
		};
	}

	public votes(): string[] {
		throw new NotImplemented(this.constructor.name, this.votes.name);
	}

	public unvotes(): string[] {
		throw new NotImplemented(this.constructor.name, this.unvotes.name);
	}

	public username(): string {
		throw new NotImplemented(this.constructor.name, this.username.name);
	}

	public validatorPublicKey(): string {
		throw new NotImplemented(this.constructor.name, this.validatorPublicKey.name);
	}

	// Multi-Payment
	public payments(): MultiPaymentItem[] {
		throw new NotImplemented(this.constructor.name, this.payments.name);
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
}
