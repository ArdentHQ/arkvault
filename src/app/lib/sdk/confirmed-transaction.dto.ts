/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@ardenthq/sdk-intl";

import { KeyValuePair } from "./contracts";
import { NotImplemented } from "./exceptions";
import { BindingType } from "./service-provider.contract";
import {
	ConfirmedTransactionData,
	MultiPaymentRecipient,
	TransactionDataMeta,
	UnspentTransactionData,
} from "./confirmed-transaction.dto.contract";
import { IContainer } from "./container.contracts";
import { Exceptions } from "./index";

export abstract class AbstractConfirmedTransactionData implements ConfirmedTransactionData {
	/**
	 * Various coins need post-processing to determine things like
	 * "isSent" or "isReceived" with data that comes from outside
	 * of the transaction or network data itself. This object can
	 * be used to store the data necessary for those actions.
	 */
	readonly #meta: Record<string, TransactionDataMeta> = {};

	readonly #types = [
		{ type: "htlcClaim", method: "isHtlcClaim" },
		{ type: "htlcLock", method: "isHtlcLock" },
		{ type: "htlcRefund", method: "isHtlcRefund" },
		{ type: "ipfs", method: "isIpfs" },
		{ type: "magistrate", method: "isMagistrate" },
		{ type: "multiPayment", method: "isMultiPayment" },
		{ type: "multiSignature", method: "isMultiSignatureRegistration" },
		{ type: "secondSignature", method: "isSecondSignature" },
		{ type: "transfer", method: "isTransfer" },
		{ type: "usernameRegistration", method: "isUsernameRegistration" },
		{ type: "unlockToken", method: "isUnlockToken" },
		{ type: "usernameResignation", method: "isUsernameResignation" },
		{ type: "unvote", method: "isUnvote" },
		{ type: "validatorRegistration", method: "isValidatorRegistration" },
		{ type: "validatorResignation", method: "isValidatorResignation" },
		{ type: "vote", method: "isVote" },
		{ type: "voteCombination", method: "isVoteCombination" },

		// `delegate` methods should be after `validator` methods
		{ type: "delegateRegistration", method: "isDelegateRegistration" },
		{ type: "delegateResignation", method: "isDelegateResignation" },
	];

	protected decimals?: number;

	protected data!: KeyValuePair;

	protected readonly bigNumberService: any; // @TODO: import BigNumberService causes a circular dependency

	public constructor(container: IContainer) {
		this.bigNumberService = container.get(BindingType.BigNumberService);
	}

	public configure(data: any) {
		this.data = data;

		return this;
	}

	public withDecimals(decimals?: number | string): this {
		this.decimals = typeof decimals === "string" ? Number.parseInt(decimals) : decimals;

		return this;
	}

	public id(): string {
		throw new NotImplemented(this.constructor.name, this.id.name);
	}

	public blockId(): string | undefined {
		return undefined;
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

	public timestamp(): DateTime | undefined {
		return undefined;
	}

	public confirmations(): BigNumber {
		return BigNumber.ZERO;
	}

	public sender(): string {
		throw new NotImplemented(this.constructor.name, this.sender.name);
	}

	public senders(): MultiPaymentRecipient[] {
		return [];
	}

	public recipient(): string {
		throw new NotImplemented(this.constructor.name, this.recipient.name);
	}

	public recipients(): MultiPaymentRecipient[] {
		return [];
	}

	public amount(): BigNumber {
		throw new NotImplemented(this.constructor.name, this.amount.name);
	}

	public fee(): BigNumber {
		throw new NotImplemented(this.constructor.name, this.fee.name);
	}

	public memo(): string | undefined {
		return undefined;
	}

	public nonce(): BigNumber {
		throw new NotImplemented(this.constructor.name, this.nonce.name);
	}

	public asset(): Record<string, unknown> {
		return {};
	}

	public inputs(): UnspentTransactionData[] {
		return [];
	}

	public outputs(): UnspentTransactionData[] {
		return [];
	}

	public isConfirmed(): boolean {
		return this.confirmations().isGreaterThanOrEqualTo(1);
	}

	public isReturn(): boolean {
		return this.isSent() && this.isReceived();
	}

	public isSent(): boolean {
		return false;
	}

	public isReceived(): boolean {
		return false;
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

	// Second-Signature Registration
	public secondPublicKey(): string {
		throw new NotImplemented(this.constructor.name, this.secondPublicKey.name);
	}

	// Delegate Registration
	public username(): string {
		throw new NotImplemented(this.constructor.name, this.username.name);
	}

	public validatorPublicKey(): string {
		throw new NotImplemented(this.constructor.name, this.validatorPublicKey.name);
	}

	// Vote
	public votes(): string[] {
		throw new NotImplemented(this.constructor.name, this.votes.name);
	}

	public unvotes(): string[] {
		throw new NotImplemented(this.constructor.name, this.unvotes.name);
	}

	// Multi-Signature Registration
	public publicKeys(): string[] {
		throw new NotImplemented(this.constructor.name, this.publicKeys.name);
	}

	public min(): number {
		throw new NotImplemented(this.constructor.name, this.min.name);
	}

	// IPFS
	public hash(): string {
		throw new NotImplemented(this.constructor.name, this.hash.name);
	}

	// Multi-Payment
	public payments(): { recipientId: string; amount: BigNumber }[] {
		throw new NotImplemented(this.constructor.name, this.payments.name);
	}

	public methodHash(): string {
		return "transfer";
	}

	// HTLC Claim / Refund
	public lockTransactionId(): string {
		throw new NotImplemented(this.constructor.name, this.lockTransactionId.name);
	}

	// HTLC Claim
	public unlockSecret(): string {
		throw new NotImplemented(this.constructor.name, this.unlockSecret.name);
	}

	// HTLC Lock
	public secretHash(): string {
		throw new NotImplemented(this.constructor.name, this.secretHash.name);
	}

	public expirationType(): number {
		throw new NotImplemented(this.constructor.name, this.expirationType.name);
	}

	public expirationValue(): number {
		throw new NotImplemented(this.constructor.name, this.expirationValue.name);
	}

	public toObject(): KeyValuePair {
		return {
			amount: this.amount(),
			asset: this.asset(),
			confirmations: this.confirmations(),
			fee: this.fee(),
			id: this.id(),
			recipient: this.recipient(),
			sender: this.sender(),
			timestamp: this.timestamp(),
			type: this.type(),
		};
	}

	public toJSON(): KeyValuePair {
		return {
			...this.toObject(),
			amount: this.amount().toString(),
			confirmations: this.confirmations().toString(),
			fee: this.fee().toString(),
			timestamp: this.timestamp()?.toISOString(),
		};
	}

	public toHuman(): KeyValuePair {
		return {
			...this.toObject(),
			amount: this.amount().toHuman(),
			confirmations: this.confirmations().toString(),
			fee: this.fee().toHuman(),
			timestamp: this.timestamp()?.toISOString(),
		};
	}

	public raw(): KeyValuePair {
		return this.data;
	}

	public hasPassed(): boolean {
		return Object.keys(this.data).length > 0;
	}

	public hasFailed(): boolean {
		return !this.hasPassed();
	}

	public getMeta(key: string): TransactionDataMeta {
		return this.#meta[key];
	}

	public setMeta(key: string, value: TransactionDataMeta): void {
		this.#meta[key] = value;
	}

	public async normalizeData(): Promise<void> {
		throw new Exceptions.NotImplemented(this.constructor.name, this.normalizeData.name);
	}

	public isSuccess(): boolean {
		throw new Exceptions.NotImplemented(this.constructor.name, this.isSuccess.name);
	}
}
