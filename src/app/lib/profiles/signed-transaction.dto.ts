/* istanbul ignore file */

import { DTO } from "@/app/lib/mainsail";
import { IReadWriteWallet } from "./contracts.js";

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { ExtendedTransactionRecipient } from "./transaction.dto.js";
import { SignedTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.js";

export class ExtendedSignedTransactionData {
	readonly #data: SignedTransactionData;
	readonly #wallet: IReadWriteWallet;

	public constructor(data: SignedTransactionData, wallet: IReadWriteWallet) {
		this.#data = data;
		this.#wallet = wallet;
	}

	public data(): SignedTransactionData {
		return this.#data;
	}

	public hash(): string {
		return this.#data.hash();
	}

	public type(): string {
		return this.#data.type();
	}

	public from(): string {
		return this.#data.from();
	}

	public to(): string {
		return this.#data.to();
	}

	public value(): number {
		return this.#data.value().toHuman();
	}

	public convertedAmount(): number {
		return this.#convertAmount(this.value());
	}

	public fee(): number {
		return this.#data.fee().toHuman();
	}

	public convertedFee(): number {
		return this.#convertAmount(this.fee());
	}

	public nonce(): BigNumber {
		return this.#data.nonce();
	}

	public timestamp(): DateTime {
		return this.#data.timestamp();
	}

	public isReturn(): boolean {
		if (this.isTransfer()) {
			return this.isSent() && this.isReceived();
		}

		if (this.isMultiPayment()) {
			return this.recipients().every(({ address }) => address === this.from());
		}

		return false;
	}

	public isSent(): boolean {
		return [this.#wallet.address(), this.#wallet.publicKey()].includes(this.from());
	}

	public isReceived(): boolean {
		return [this.#wallet.address(), this.#wallet.publicKey()].includes(this.to());
	}

	public isTransfer(): boolean {
		return this.#data.isTransfer();
	}

	public isSecondSignature(): boolean {
		return this.#data.isSecondSignature();
	}

	public isValidatorRegistration(): boolean {
		return this.#data.isValidatorRegistration();
	}

	public isUpdateValidator(): boolean {
		return this.#data.isUpdateValidator();
	}

	public isUsernameRegistration(): boolean {
		return this.#data.isUsernameRegistration();
	}

	public isUsernameResignation(): boolean {
		return this.#data.isUsernameResignation();
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

	public isMultiSignatureRegistration(): boolean {
		return false;
	}

	public isMultiPayment(): boolean {
		return this.#data.isMultiPayment();
	}

	public isValidatorResignation(): boolean {
		return this.#data.isValidatorResignation();
	}

	public total(): number {
		if (this.isReturn()) {
			return this.value() - this.fee();
		}

		// We want to return amount + fee for the transactions using multi-signature
		// because the total should be calculated from the sender perspective.
		// This is specific for signed - unconfirmed transactions only.
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

	public get<T = string>(key: string): T {
		return this.#data.get(key);
	}

	public toString(): string {
		return this.#data.toString();
	}

	public toBroadcast(): any {
		return this.#data.toBroadcast();
	}

	public toObject(): DTO.SignedTransactionObject {
		return this.#data.toObject();
	}

	public wallet(): IReadWriteWallet {
		return this.#wallet;
	}

	public votes(): string[] {
		return this.#data.votes();
	}

	public unvotes(): string[] {
		return this.#data.unvotes();
	}

	// @TODO: remove those after introducing proper signed tx DTOs (ARK/LSK specific)
	public username(): string {
		return this.#data.username();
	}

	public validatorPublicKey(): string {
		return this.#data.validatorPublicKey();
	}

	public payments(): { recipientId: string; amount: number }[] {
		return this.#data.payments().map((payment) => ({
			amount: payment.amount.toHuman(),
			recipientId: payment.recipientId,
		}));
	}

	public recipients(): ExtendedTransactionRecipient[] {
		return this.#data.recipients().map((payment: { address: string; amount: BigNumber }) => ({
			address: payment.address,
			amount: payment.amount.toHuman(),
		}));
	}

	public explorerLink(): string {
		return this.#wallet.link().transaction(this.hash());
	}

	public explorerLinkForBlock(): string | undefined {
		return undefined;
	}

	public memo(): string | undefined {
		return this.#data.memo();
	}

	public blockHash(): string | undefined {
		return undefined;
	}

	public confirmations(): BigNumber {
		return BigNumber.ZERO;
	}

	public isConfirmed(): boolean {
		return false;
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

	public isSuccess(): boolean {
		return false;
	}
}
