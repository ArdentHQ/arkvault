/* istanbul ignore file */

import { Contracts, DTO } from "@ardenthq/sdk";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";

import { MultiPaymentItem } from "@ardenthq/sdk/source/confirmed-transaction.dto.contract.js";
import { container } from "./container.js";
import { Identifiers } from "./container.models.js";
import { IExchangeRateService, IReadWriteWallet } from "./contracts.js";
import { ExtendedTransactionRecipient } from "./transaction.dto.js";

export class ExtendedSignedTransactionData {
	readonly #data: Contracts.SignedTransactionData;
	readonly #wallet: IReadWriteWallet;

	public constructor(data: Contracts.SignedTransactionData, wallet: IReadWriteWallet) {
		this.#data = data;
		this.#wallet = wallet;
	}

	public data(): Contracts.SignedTransactionData {
		return this.#data;
	}

	public id(): string {
		return this.#data.id();
	}

	public type(): string {
		return this.#data.type();
	}

	public sender(): string {
		return this.#data.sender();
	}

	public recipient(): string {
		return this.#data.recipient();
	}

	public amount(): number {
		return this.#data.amount().toHuman();
	}

	public convertedAmount(): number {
		return this.#convertAmount(this.amount());
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
			let isReturn = true;

			for (const recipient of this.recipients().values()) {
				if (recipient.address !== this.sender()) {
					isReturn = false;
					break;
				}
			}

			return isReturn;
		}

		return false;
	}

	public isSent(): boolean {
		return [this.#wallet.address(), this.#wallet.publicKey()].includes(this.sender());
	}

	public isReceived(): boolean {
		return [this.#wallet.address(), this.#wallet.publicKey()].includes(this.recipient());
	}

	public isTransfer(): boolean {
		return this.#data.isTransfer();
	}

	public isSecondSignature(): boolean {
		return this.#data.isSecondSignature();
	}

	public isDelegateRegistration(): boolean {
		return this.#data.isDelegateRegistration();
	}

	public isValidatorRegistration(): boolean {
		return this.#data.isValidatorRegistration();
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
		return this.#data.isMultiSignatureRegistration();
	}

	public isIpfs(): boolean {
		return this.#data.isIpfs();
	}

	public isMultiPayment(): boolean {
		return this.#data.isMultiPayment();
	}

	public isDelegateResignation(): boolean {
		return this.#data.isDelegateResignation();
	}

	public isValidatorResignation(): boolean {
		return this.#data.isValidatorResignation();
	}

	public isHtlcLock(): boolean {
		return this.#data.isHtlcLock();
	}

	public isHtlcClaim(): boolean {
		return this.#data.isHtlcClaim();
	}

	public isHtlcRefund(): boolean {
		return this.#data.isHtlcRefund();
	}

	public isMagistrate(): boolean {
		return this.#data.isMagistrate();
	}

	public usesMultiSignature(): boolean {
		return this.#data.usesMultiSignature();
	}

	public total(): number {
		if (this.isReturn()) {
			return this.amount() - this.fee();
		}

		// We want to return amount + fee for the transactions using multi-signature
		// because the total should be calculated from the sender perspective.
		// This is specific for signed - unconfirmed transactions only.
		if (this.isSent() || this.usesMultiSignature()) {
			return this.amount() + this.fee();
		}

		let total = this.amount();

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

	public hash(): string {
		return this.#data.hash();
	}

	// @ts-ignore
	public payments(): { recipientId: string; amount: number }[] {
		return this.#data.payments().map((payment) => {
			return {
				amount: payment.amount.toHuman(),
				recipientId: payment.recipientId,
			};
		});
	}

	public recipients(): ExtendedTransactionRecipient[] {
		return this.#data.recipients().map((payment: { address: string; amount: BigNumber }) => ({
			address: payment.address,
			amount: payment.amount.toHuman(),
		}));
	}

	public explorerLink(): string {
		return this.#wallet.coin().link().transaction(this.id());
	}

	public explorerLinkForBlock(): string | undefined {
		return undefined;
	}

	public memo(): string | undefined {
		return this.#data.memo();
	}

	public blockId(): string | undefined {
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

		return container
			.get<IExchangeRateService>(Identifiers.ExchangeRateService)
			.exchange(this.wallet().currency(), this.wallet().exchangeCurrency(), timestamp, value);
	}
}
