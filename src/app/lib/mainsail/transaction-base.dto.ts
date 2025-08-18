import type { MultiPaymentItem } from "@/app/lib/mainsail/confirmed-transaction.dto.contract";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { UnitConverter } from "@arkecosystem/typescript-crypto";
import { AbiType, decodeFunctionData } from "./helpers/decode-function-data";
import { TransactionTypeService } from "./transaction-type.service";
import { Hex } from "viem";

export type KeyValuePair = Record<string, unknown>;

export interface TransactionBaseDTO {
	hash: string;
	nonce: string | number;
	from: string;
	to: string;
	value: string | number | bigint;
	data: Hex;
	gasPrice: string | number | bigint;
}

export abstract class TransactionBaseData<TData extends TransactionBaseDTO> {
	protected data!: TData;
	protected decimals?: number;
	#meta: Record<string, unknown> = {};

	public configure(data: TData) {
		this.data = data;
		return this;
	}

	public withDecimals(decimals?: number | string): this {
		this.decimals = typeof decimals === "string" ? Number.parseInt(decimals) : decimals;
		return this;
	}

	public setMeta(key: string, value: unknown): void {
		this.#meta[key] = value;
	}

	public getMeta<T = unknown>(key: string): T {
		return this.#meta[key] as T;
	}

	public hash(): string {
		return this.data.hash;
	}
	public nonce(): number {
		return typeof this.data.nonce === "string" ? Number(this.data.nonce) : this.data.nonce;
	}
	public from(): string {
		return this.data.from;
	}
	public to(): string {
		return this.data.to;
	}

	public type(): string {
		if (this.isVoteCombination()) {
			return "voteCombination";
		}
		if (this.isMultiPayment()) {
			return "multiPayment";
		}
		if (this.isSecondSignature()) {
			return "secondSignature";
		}
		if (this.isTransfer()) {
			return "transfer";
		}
		if (this.isUsernameRegistration()) {
			return "usernameRegistration";
		}
		if (this.isUsernameResignation()) {
			return "usernameResignation";
		}
		if (this.isUnvote()) {
			return "unvote";
		}
		if (this.isValidatorRegistration()) {
			return "validatorRegistration";
		}
		if (this.isValidatorResignation()) {
			return "validatorResignation";
		}
		if (this.isVote()) {
			return "vote";
		}
		if (this.isUpdateValidator()) {
			return "updateValidator";
		}

		const identifierName = TransactionTypeService.getIdentifierName(this.data as unknown as object);
		if (identifierName !== null) {
			return identifierName;
		}

		return this.methodHash();
	}

	public isTransfer(): boolean {
		return TransactionTypeService.isTransfer(this.data as unknown as object);
	}
	public isSecondSignature(): boolean {
		return false;
	}
	public isUsernameRegistration(): boolean {
		return TransactionTypeService.isUsernameRegistration(this.data as unknown as object);
	}
	public isUsernameResignation(): boolean {
		return TransactionTypeService.isUsernameResignation(this.data as unknown as object);
	}
	public isValidatorRegistration(): boolean {
		return TransactionTypeService.isValidatorRegistration(this.data as unknown as object);
	}
	public isUpdateValidator(): boolean {
		return TransactionTypeService.isUpdateValidator(this.data as unknown as object);
	}
	public isVoteCombination(): boolean {
		return TransactionTypeService.isVoteCombination(this.data as unknown as object);
	}
	public isVote(): boolean {
		return TransactionTypeService.isVote(this.data as unknown as object);
	}
	public isUnvote(): boolean {
		return TransactionTypeService.isUnvote(this.data as unknown as object);
	}
	public isMultiPayment(): boolean {
		return TransactionTypeService.isMultiPayment(this.data as unknown as object);
	}
	public isValidatorResignation(): boolean {
		return TransactionTypeService.isValidatorResignation(this.data as unknown as object);
	}

	public isSent(): boolean {
		return [this.getMeta("address"), this.getMeta("publicKey")].includes(this.from());
	}
	public isReceived(): boolean {
		return [this.getMeta("address"), this.getMeta("publicKey")].includes(this.to());
	}
	public isReturn(): boolean {
		if (this.isTransfer()) {
			return this.isSent() && this.isReceived();
		}
		if (this.isMultiPayment()) {
			return this.recipients().some(({ address }) => address === this.from());
		}
		return false;
	}

	public username(): string {
		return decodeFunctionData(this.data.data, AbiType.Username).args[0] as string;
	}

	public validatorPublicKey(): string {
		const key = decodeFunctionData(this.data.data).args[0] as string;
		return key.slice(2);
	}

	public votes(): string[] {
		const voteAddress = decodeFunctionData(this.data.data).args[0] as string;
		return [voteAddress];
	}

	public unvotes(): string[] {
		return [];
	}

	public payments(): MultiPaymentItem[] {
		if (!this.isMultiPayment()) {
			return [];
		}
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

	public abstract recipients(): { address: string; amount: number | BigNumber }[];

	public value(): BigNumber {
		if (this.isMultiPayment()) {
			return BigNumber.sum(this.payments().map(({ amount }) => amount));
		}
		return BigNumber.make(UnitConverter.formatUnits(String(this.data.value), "ark"));
	}

	public fee(): BigNumber {
		return this.computeFee();
	}
	protected abstract computeFee(): BigNumber;

	public abstract isSuccess(): boolean;
	public abstract isConfirmed(): boolean;
	public abstract confirmations(): BigNumber;

	public abstract timestamp(): DateTime | undefined;
	protected abstract serializeTimestamp(): string | undefined;

	public methodHash(): string {
		const d = this.data.data;
		return d.length >= 10 ? d.slice(0, 10) : d;
	}

	public raw(): KeyValuePair {
		return this.data as unknown as KeyValuePair;
	}

	public toObject(): KeyValuePair {
		return {
			fee: this.fee(),
			from: this.from(),
			hash: this.hash(),
			timestamp: this.timestamp(),
			to: this.to(),
			type: this.type(),
			value: this.value(),
		};
	}

	public toJSON(): KeyValuePair {
		return {
			...this.toObject(),
			fee: this.fee().toString(),
			timestamp: this.serializeTimestamp(),
			value: this.value().toString(),
		};
	}

	public toHuman(): KeyValuePair {
		const fee = (this.fee() as unknown as { toHuman?: () => string }).toHuman?.() ?? this.fee().toString();
		const value = (this.value() as unknown as { toHuman?: () => string }).toHuman?.() ?? this.value().toString();
		return {
			...this.toObject(),
			fee,
			timestamp: this.serializeTimestamp(),
			value,
		};
	}
}
