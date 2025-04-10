/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import { strict as assert } from "assert";

import { MultiPaymentItem, MultiPaymentRecipient } from "./confirmed-transaction.dto.contract";
import { IContainer } from "./container.contracts";
import { RawTransactionData, SignedTransactionData } from "./contracts";
import { NotImplemented } from "./exceptions";
import { BindingType } from "./service-provider.contract";
import { BigNumberService } from "./services";
import { SignedTransactionObject } from "./signed-transaction.dto.contract";

export class AbstractSignedTransactionData implements SignedTransactionData {
	protected identifier!: string;
	protected signedData!: RawTransactionData;
	protected broadcastData!: any;
	protected decimals!: number | undefined;

	readonly #types = [
		{ method: "isIpfs", type: "ipfs" },
		{ method: "isMagistrate", type: "magistrate" },
		{ method: "isMultiPayment", type: "multiPayment" },
		{ method: "isMultiSignatureRegistration", type: "multiSignature" },
		{ method: "isSecondSignature", type: "secondSignature" },
		{ method: "isTransfer", type: "transfer" },
		{ method: "isUnlockToken", type: "unlockToken" },
		{ method: "isUsernameRegistration", type: "usernameRegistration" },
		{ method: "isUsernameResignation", type: "usernameResignation" },
		{ method: "isUnvote", type: "unvote" },
		{ method: "isValidatorRegistration", type: "validatorRegistration" },
		{ method: "isValidatorResignation", type: "validatorResignation" },
		{ method: "isVote", type: "vote" },
		{ method: "isVoteCombination", type: "voteCombination" },

		// `delegate` methods should be after `validator` methods
		{ method: "isDelegateRegistration", type: "delegateRegistration" },
		{ method: "isDelegateResignation", type: "delegateResignation" },
	];

	protected readonly bigNumberService: BigNumberService;

	public constructor(container: IContainer) {
		this.bigNumberService = container.get(BindingType.BigNumberService);
	}

	public configure(
		identifier: string,
		signedData: RawTransactionData,
		broadcastData?: any,
		decimals?: number | string,
	) {
		assert.ok(signedData);

		this.identifier = identifier;
		this.signedData = signedData;
		this.broadcastData = broadcastData ?? signedData;
		this.decimals = typeof decimals === "string" ? Number.parseInt(decimals) : decimals;

		return this;
	}

	public setAttributes(attributes: { identifier: string }): void {
		this.identifier = attributes.identifier;
	}

	public id(): string {
		return this.identifier;
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

	public sender(): string {
		throw new NotImplemented(this.constructor.name, this.sender.name);
	}

	public recipient(): string {
		throw new NotImplemented(this.constructor.name, this.recipient.name);
	}

	public amount(): BigNumber {
		throw new NotImplemented(this.constructor.name, this.amount.name);
	}

	public fee(): BigNumber {
		return BigNumber.ZERO;
	}

	public memo(): string | undefined {
		return undefined;
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

	public isDelegateRegistration(): boolean {
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

	public isMultiSignatureRegistration(): boolean {
		return false;
	}

	public isIpfs(): boolean {
		return false;
	}

	public isMultiPayment(): boolean {
		return false;
	}

	public isDelegateResignation(): boolean {
		return false;
	}

	public isValidatorResignation(): boolean {
		return false;
	}

	public isHtlcLock(): boolean {
		return false;
	}

	public isHtlcClaim(): boolean {
		return false;
	}

	public isHtlcRefund(): boolean {
		return false;
	}

	public isMagistrate(): boolean {
		return false;
	}

	public isUnlockToken(): boolean {
		return false;
	}

	public methodHash(): string {
		return "transfer";
	}

	public usesMultiSignature(): boolean {
		return false;
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
		return this.normalizeTransactionData(this.broadcastData);
	}

	public toSignedData(): any {
		return this.normalizeTransactionData(this.signedData);
	}

	public toObject(): SignedTransactionObject {
		return {
			amount: this.amount().toFixed(0),
			broadcast: this.toBroadcast(),
			data: this.data(),
			fee: this.fee().toFixed(0),
			id: this.id(),
			recipient: this.recipient(),
			sender: this.sender(),
			timestamp: this.timestamp().toISOString(),
		};
	}

	public votes(): string[] {
		throw new NotImplemented(this.constructor.name, this.votes.name);
	}

	public unvotes(): string[] {
		throw new NotImplemented(this.constructor.name, this.unvotes.name);
	}

	// @TODO: remove those after introducing proper signed tx DTOs (ARK/LSK specific)
	public username(): string {
		return this.signedData.asset.delegate.username;
	}

	public validatorPublicKey(): string {
		throw new NotImplemented(this.constructor.name, this.validatorPublicKey.name);
	}

	public hash(): string {
		return this.signedData.asset.ipfs;
	}

	// Multi-Payment
	public payments(): MultiPaymentItem[] {
		throw new NotImplemented(this.constructor.name, this.payments.name);
	}

	public recipients(): MultiPaymentRecipient[] {
		if (this.isMultiPayment()) {
			return this.payments().map((payment: { recipientId: string; amount: BigNumber }) => ({
				address: payment.recipientId,
				amount: this.bigNumberService.make(payment.amount),
			}));
		}

		return [
			{
				address: this.recipient(),
				amount: this.amount(),
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

	public async sanitizeSignatures(): Promise<void> {
		return undefined;
	}
}
