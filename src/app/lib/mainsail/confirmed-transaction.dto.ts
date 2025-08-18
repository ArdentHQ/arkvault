import { Contracts, Exceptions } from "@/app/lib/mainsail";
import { MultiPaymentItem, TransactionDataMeta } from "@/app/lib/mainsail/confirmed-transaction.dto.contract";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { AbiType, decodeFunctionData } from "./helpers/decode-function-data";
import { AddressService } from "./address.service";
import { UnitConverter } from "@arkecosystem/typescript-crypto";
import { TransactionBaseData, type TransactionBaseDTO, type KeyValuePair } from "./transaction-base.dto";

export interface ConfirmedTransactionDTO extends TransactionBaseDTO {
	gas: number;
	confirmations: string | number;
	timestamp?: string | number;
	receipt?: { status?: number };
	blockHash?: string;
	asset?: {
		signature?: { publicKey: string };
		lock?: { expiration: { type: number; value: number } };
	};
	senderPublicKey?: string;
}

export class ConfirmedTransactionData extends TransactionBaseData<ConfirmedTransactionDTO> {
	readonly #addressService = new AddressService();
	readonly #meta: Record<string, TransactionDataMeta> = {};

	public getMeta<T = unknown>(key: string): T {
		return this.#meta[key] as T;
	}
	public setMeta(key: string, value: TransactionDataMeta): void {
		this.#meta[key] = value;
		super.setMeta(key, value);
	}

	// Multi-Signature Registration
	public publicKeys(): string[] {
		throw new Exceptions.NotImplemented(this.constructor.name, this.publicKeys.name);
	}

	public min(): number {
		throw new Exceptions.NotImplemented(this.constructor.name, this.min.name);
	}

	public blockHash(): string | undefined {
		return this.data.blockHash;
	}

	public normalizeData(): void {
		if (!this.data.senderPublicKey) return;
		const { address } = this.#addressService.fromPublicKey(this.data.senderPublicKey);

		(this.data as unknown as { sender?: string }).sender = address;
	}

	public recipients(): Contracts.MultiPaymentRecipient[] {
		if (!this.isMultiPayment()) return [];
		return this.payments().map((payment) => ({
			address: payment.recipientId,
			amount: payment.amount,
		}));
	}

	protected computeFee(): BigNumber {
		const gasPrice = BigNumber.make(UnitConverter.formatUnits(String(this.data.gasPrice), "ark"));
		return gasPrice.times(this.data.gas);
	}

	public isSuccess(): boolean {
		return this.data.receipt?.status === 1;
	}
	public isConfirmed(): boolean {
		return this.confirmations().isGreaterThanOrEqualTo(1);
	}
	public confirmations(): BigNumber {
		return BigNumber.make(this.data.confirmations);
	}

	public timestamp(): DateTime | undefined {
		const ts = this.data.timestamp;
		if (ts === undefined || ts === null) return undefined;
		return DateTime.fromUnix(Number(ts) / 1000);
	}
	protected serializeTimestamp(): string | undefined {
		return this.timestamp()?.toISOString();
	}

	// Username registration
	public username(): string {
		return decodeFunctionData(this.data.data, AbiType.Username).args[0] as string;
	}

	public validatorPublicKey(): string {
		const key = decodeFunctionData(this.data.data).args[0] as string;
		return key.slice(2);
	}

	// Vote
	public votes(): string[] {
		const voteAddress = decodeFunctionData(this.data.data).args[0] as string;
		return [voteAddress];
	}

	public unvotes(): string[] {
		return [];
	}

	// Second-Signature Registration
	public secondPublicKey(): string {
		return this.data.asset?.signature?.publicKey as string;
	}

	// Multi-Payment
	public payments(): MultiPaymentItem[] {
		const payments: MultiPaymentItem[] = [];
		const [recipients, amounts] = decodeFunctionData(this.data.data, AbiType.MultiPayment).args;
		for (const index in recipients) {
			payments[index] = {
				amount: BigNumber.make(UnitConverter.formatUnits(amounts[index], "ark")),
				recipientId: recipients[index],
			};
		}
		return payments;
	}

	public expirationType(): number {
		return this.data.asset?.lock?.expiration.type as number;
	}

	public expirationValue(): number {
		return this.data.asset?.lock?.expiration.value as number;
	}

	public toObject(): KeyValuePair {
		return {
			...super.toObject(),
			confirmations: this.confirmations(),
		};
	}

	public toJSON(): KeyValuePair {
		return {
			...super.toJSON(),
			confirmations: this.confirmations().toString(),
		};
	}

	public toHuman(): KeyValuePair {
		const obj = super.toHuman();
		return {
			...obj,
			confirmations: this.confirmations().toString(),
		};
	}

	public hasPassed(): boolean {
		return this.data != null && Object.keys(this.data as object).length > 0;
	}

	public hasFailed(): boolean {
		return !this.hasPassed();
	}
}
