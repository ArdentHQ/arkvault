import { Contracts, DTO, IoC } from "@/app/lib/sdk";
import { MultiPaymentItem } from "@/app/lib/sdk/confirmed-transaction.dto.contract";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";

import { AbiType, decodeFunctionData } from "./helpers/decode-function-data";
import { formatUnits } from "./helpers/format-units";
import { TransactionTypeService } from "./transaction-type.service";
import { AddressService } from "./address.service";

export class ConfirmedTransactionData extends DTO.AbstractConfirmedTransactionData {
	readonly #addressService: AddressService;

	public constructor(container: IoC.IContainer) {
		super(container);

		this.#addressService = new AddressService(container);
	}

	public override hash(): string {
		return this.data.hash;
	}

	public override nonce(): BigNumber {
		return this.data.nonce;
	}

	public override blockHash(): string | undefined {
		return this.data.blockHash;
	}

	public override timestamp(): DateTime | undefined {
		return DateTime.fromUnix(Number(this.data.timestamp) / 1000);
	}

	public override confirmations(): BigNumber {
		return BigNumber.make(this.data.confirmations);
	}

	public override from(): string {
		return this.data.from;
	}

	public override to(): string {
		return this.data.to;
	}

	public override recipients(): Contracts.MultiPaymentRecipient[] {
		if (!this.isMultiPayment()) {
			return [];
		}

		return this.payments().map((payment) => ({
			address: payment.recipientId,
			amount: payment.amount,
		}));
	}

	public override value(): BigNumber {
		if (this.isMultiPayment()) {
			return BigNumber.sum(this.payments().map(({ amount }) => amount));
		}

		return formatUnits(this.data.value, "ark");
	}

	public override fee(): BigNumber {
		const gasPrice = formatUnits(this.data.gasPrice, "ark");
		return gasPrice.times(this.data.gas);
	}

	public override isReturn(): boolean {
		if (this.isTransfer()) {
			return this.isSent() && this.isReceived();
		}

		if (this.isMultiPayment()) {
			return this.recipients().some(({ address }: Contracts.MultiPaymentRecipient) => address === this.from());
		}

		return false;
	}

	public override isSent(): boolean {
		return [this.getMeta("address"), this.getMeta("publicKey")].includes(this.from());
	}

	public override isReceived(): boolean {
		return [this.getMeta("address"), this.getMeta("publicKey")].includes(this.to());
	}

	public override isTransfer(): boolean {
		return TransactionTypeService.isTransfer(this.data);
	}

	public override isSecondSignature(): boolean {
		return false;
	}

	public override isUsernameRegistration(): boolean {
		return TransactionTypeService.isUsernameRegistration(this.data);
	}

	public override isUsernameResignation(): boolean {
		return TransactionTypeService.isUsernameResignation(this.data);
	}

	public override isValidatorRegistration(): boolean {
		return TransactionTypeService.isValidatorRegistration(this.data);
	}

	public override isVoteCombination(): boolean {
		return TransactionTypeService.isVoteCombination(this.data);
	}

	public override isVote(): boolean {
		return TransactionTypeService.isVote(this.data);
	}

	public override isUnvote(): boolean {
		return TransactionTypeService.isUnvote(this.data);
	}

	public override isMultiPayment(): boolean {
		return TransactionTypeService.isMultiPayment(this.data);
	}

	public override isValidatorResignation(): boolean {
		return TransactionTypeService.isValidatorResignation(this.data);
	}

	// Username registration
	public override username(): string {
		return decodeFunctionData(this.data.data, AbiType.Username).args[0] as string;
	}

	public override validatorPublicKey(): string {
		const key = decodeFunctionData(this.data.data).args[0] as string;
		return key.slice(2); // removes 0x part
	}

	// Vote
	public override votes(): string[] {
		const voteAddress = decodeFunctionData(this.data.data).args[0] as string;
		return [voteAddress];
	}

	public override unvotes(): string[] {
		return [];
	}

	// Second-Signature Registration
	public override secondPublicKey(): string {
		return this.data.asset.signature.publicKey;
	}

	// Multi-Payment
	public override payments(): MultiPaymentItem[] {
		const payments: MultiPaymentItem[] = [];

		const [recipients, amounts] = decodeFunctionData(this.data.data, AbiType.MultiPayment).args;

		for (const index in recipients) {
			payments[index] = {
				amount: formatUnits(amounts[index], "ark"),
				recipientId: recipients[index],
			};
		}

		return payments;
	}

	public override methodHash(): string {
		// Confirmed transactions have data prefixed with `0x`
		// that is why we are using first 10 chars to extract method.
		return this.data.data.slice(0, 10);
	}

	public override expirationType(): number {
		return this.data.asset.lock.expiration.type;
	}

	public override expirationValue(): number {
		return this.data.asset.lock.expiration.value;
	}

	public override async normalizeData(): Promise<void> {
		const { address } = await this.#addressService.fromPublicKey(this.data.senderPublicKey);
		this.data.sender = address;
	}

	public override isSuccess(): boolean {
		return this.data.receipt.status === 1;
	}
}
