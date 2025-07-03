/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { Contracts } from "@/app/lib/mainsail";
import { IReadWriteWallet } from "./contracts.js";

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { ConfirmedTransactionData } from "../mainsail/confirmed-transaction.dto.js";

export interface ExtendedTransactionRecipient {
	address: string;
	amount: number;
}

export class ExtendedConfirmedTransactionData implements Contracts.ConfirmedTransactionData {
	readonly #wallet: IReadWriteWallet;
	readonly #data: ConfirmedTransactionData;

	public constructor(wallet: IReadWriteWallet, data: ConfirmedTransactionData) {
		this.#wallet = wallet;
		this.#data = data;
	}

	public hash(): string {
		return this.#data.hash();
	}

	public blockHash(): string | undefined {
		return this.#data.blockHash();
	}

	public type(): string {
		return this.#data.type();
	}

	public timestamp(): DateTime | undefined {
		return this.#data.timestamp();
	}

	public confirmations(): BigNumber {
		return this.#data.confirmations();
	}

	public from(): string {
		return this.#data.from();
	}

	public to(): string {
		return this.#data.to();
	}

	// @ts-ignore
	public recipients(): ExtendedTransactionRecipient[] {
		/* istanbul ignore next */
		return this.#data.recipients().map(({ address, amount }) => ({ address, amount: amount.toHuman() }));
	}

	// @ts-ignore
	public value(): number {
		return this.#data.value().toHuman();
	}

	public convertedAmount(): number {
		return this.#convertAmount(this.value());
	}

	// @ts-ignore
	public fee(): number {
		return this.#data.fee().toHuman();
	}

	public convertedFee(): number {
		return this.#convertAmount(this.fee());
	}

	public memo(): string | undefined {
		// @ts-ignore
		return this.#data.memo?.();
	}

	public nonce(): BigNumber {
		return this.#data.nonce();
	}

	public isConfirmed(): boolean {
		return this.#data.isConfirmed();
	}

	public isSent(): boolean {
		return this.#data.isSent();
	}

	public isReceived(): boolean {
		return this.#data.isReceived();
	}

	public isReturn(): boolean {
		return this.#data.isReturn();
	}

	public isTransfer(): boolean {
		return this.#data.isTransfer();
	}

	public isSecondSignature(): boolean {
		return this.#data.isSecondSignature();
	}

	public isUsernameRegistration(): boolean {
		return this.#data.isUsernameRegistration();
	}

	public isUsernameResignation(): boolean {
		return this.#data.isUsernameResignation();
	}

	public isValidatorRegistration(): boolean {
		return this.#data.isValidatorRegistration();
	}

	public isVoteCombination(): boolean {
		return this.#data.isVoteCombination();
	}

	public isVote(): boolean {
		return this.#data.isVote();
	}

	public isUnvote(): boolean {
		return this.#data.isUnvote();
	}

	public isMultiPayment(): boolean {
		return this.#data.isMultiPayment();
	}

	public isValidatorResignation(): boolean {
		return this.#data.isValidatorResignation();
	}

	public isUpdateValidator(): boolean {
		return this.#data.isUpdateValidator();
	}

	public username(): string {
		return this.data<Contracts.ConfirmedTransactionData>().username();
	}

	public validatorPublicKey(): string {
		return this.data<Contracts.ConfirmedTransactionData>().validatorPublicKey();
	}
	public expirationType(): number {
		return this.data<Contracts.ConfirmedTransactionData>().expirationType();
	}

	public expirationValue(): number {
		return this.data<Contracts.ConfirmedTransactionData>().expirationValue();
	}

	// @ts-ignore
	public payments(): { recipientId: string; amount: number }[] {
		return this.data<Contracts.ConfirmedTransactionData>()
			.payments()
			.map((payment) => {
				return {
					recipientId: payment.recipientId,
					amount: payment.amount.toHuman(),
				};
			});
	}

	public publicKeys(): string[] {
		return this.data<Contracts.ConfirmedTransactionData>().publicKeys();
	}

	public min(): number {
		return this.data<Contracts.ConfirmedTransactionData>().min();
	}

	public secondPublicKey(): string {
		return this.data<Contracts.ConfirmedTransactionData>().secondPublicKey();
	}

	public votes(): string[] {
		return this.data<Contracts.ConfirmedTransactionData>().votes();
	}

	public unvotes(): string[] {
		return this.data<Contracts.ConfirmedTransactionData>().unvotes();
	}

	public explorerLink(): string {
		return this.#wallet.link().transaction(this.hash());
	}

	public explorerLinkForBlock(): string | undefined {
		if (this.blockHash()) {
			return this.#wallet.link().block(this.blockHash()!);
		}

		return undefined;
	}

	public toObject(): Contracts.KeyValuePair {
		return this.#data.toObject();
	}

	public hasPassed(): boolean {
		return this.#data.hasPassed();
	}

	public hasFailed(): boolean {
		return this.#data.hasFailed();
	}

	public getMeta(key: string): Contracts.TransactionDataMeta {
		return this.#data.getMeta(key);
	}

	public setMeta(key: string, value: Contracts.TransactionDataMeta): void {
		return this.#data.setMeta(key, value);
	}

	/**
	 * These methods serve as helpers to aggregate commonly used values.
	 */

	public total(): number {
		if (this.isReturn()) {
			return this.value() - this.fee();
		}

		if (this.isSent()) {
			return this.value() + this.fee();
		}

		let total = this.value();

		if (this.isMultiPayment()) {
			for (const recipient of this.recipients()) {
				if (recipient.address !== this.wallet().address()) {
					total -= recipient.amount;
				}
			}
		}

		return total;
	}

	public convertedTotal(): number {
		return this.#convertAmount(this.total());
	}

	/**
	 * These methods serve as helpers to quickly access entities related to the transaction.
	 *
	 * These are subject to be removed at any time due to them primarily existing for usage
	 * in the Desktop and Mobile Wallet. Use them at your own risk in your own applications.
	 */

	public wallet(): IReadWriteWallet {
		return this.#wallet;
	}

	protected data<T>(): T {
		return this.#data as unknown as T;
	}

	#convertAmount(value: number): number {
		const timestamp: DateTime | undefined = this.timestamp();

		if (timestamp === undefined) {
			return 0;
		}

		return this.wallet()
			.exchangeRates()
			.exchange(this.wallet().currency(), this.wallet().exchangeCurrency(), timestamp, value);
	}

	public normalizeData(): void {
		return this.#data.normalizeData();
	}

	public isSuccess(): boolean {
		return this.#data.isSuccess();
	}
}
