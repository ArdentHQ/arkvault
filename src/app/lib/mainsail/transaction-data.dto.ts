import { Contracts } from "@/app/lib/mainsail";
import { MultiPaymentItem, TransactionDataMeta } from "@/app/lib/mainsail/confirmed-transaction.dto.contract";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { AbiType, decodeFunctionData } from "./helpers/decode-function-data";
import { AddressService } from "./address.service";
import { TransactionTypeIdentifier, UnitConverter } from "@arkecosystem/typescript-crypto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";

export type KeyValuePair = Record<string, any>;

export abstract class TransactionData {
	readonly #addressService: AddressService;
	readonly #meta: Record<string, TransactionDataMeta> = {};
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

	protected decimals?: number;
	protected data!: KeyValuePair;

	public constructor() {
		this.#addressService = new AddressService();
	}

	public configure(data: any): this {
		this.data = data;
		return this;
	}

	public withDecimals(decimals?: number | string): this {
		this.decimals = typeof decimals === "string" ? Number.parseInt(decimals) : decimals;
		return this;
	}

	public type(): string {

		if (this.isTokenTransfer()) {
			return "transfer";
		}

		if (this.isApprove()) {
			return "approve";
		}

		if (this.isRevoke()) {
			return "revoke";
		}

		if (this.isBatchTransfer()) {
			return "batchtransfer";
		}

		for (const { type, method } of this.#types) {
			if (this[method]()) {
				return type;
			}
		}

		return this.methodHash();
	}

	public isTokenTransfer() {
		if (this.data?.token?.address && this.data.type === "transfer") {
			return true;
		}

		return TransactionTypeIdentifier.isTokenTransfer(this.data.data);
	}

	public isApprove() {
		return TransactionTypeIdentifier.isApprove(this.data.data);
	}

	public isRevoke() {
		return TransactionTypeIdentifier.isRevoke(this.data.data);
	}

	public isBatchTransfer() {
		return TransactionTypeIdentifier.isBatchTransfer(this.data.data);
	}

	public token(): TokenDTO | undefined {
		if (this.isTokenTransfer() && this.data.token) {
			return new TokenDTO(this.data.token);
		}
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
			timestamp: this.timestamp()?.toISOString(),
			value: this.value().toString(),
		};
	}

	public toHuman(): KeyValuePair {
		return {
			...this.toObject(),
			fee: this.fee().toHuman(),
			timestamp: this.timestamp()?.toISOString(),
			value: this.value().toHuman(),
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

	public hash(): string {
		return this.data.hash;
	}

	public nonce(): BigNumber {
		return this.data.nonce;
	}

	public blockHash(): string | undefined {
		return this.data.blockHash;
	}

	public timestamp(): DateTime | undefined {
		return DateTime.fromUnix(Number(this.data.timestamp) / 1000);
	}

	public from(): string {
		return this.data.from;
	}

	public to(): string {
		return this.data.to;
	}

	public recipients(): Contracts.MultiPaymentRecipient[] {
		if (!this.isMultiPayment()) {
			return [];
		}

		return this.payments().map((payment) => ({
			address: payment.recipientId,
			amount: payment.amount,
		}));
	}

	public value(): BigNumber {
		if (this.isMultiPayment()) {
			return BigNumber.sum(this.payments().map(({ amount }) => amount));
		}

		return BigNumber.make(UnitConverter.formatUnits(this.data.value, "ark"));
	}

	public fee(): BigNumber {
		const gasPrice = BigNumber.make(UnitConverter.formatUnits(this.data.gasPrice, "ark"));
		return gasPrice.times(this.data.gas);
	}

	public isReturn(): boolean {
		if (this.isTransfer()) {
			return this.isSent() && this.isReceived();
		}

		if (this.isMultiPayment()) {
			return this.recipients().every(({ address }: Contracts.MultiPaymentRecipient) => address === this.from());
		}

		return false;
	}

	public isSent(): boolean {
		return [this.getMeta("address"), this.getMeta("publicKey")].includes(this.from());
	}

	public isReceived(): boolean {
		return [this.getMeta("address"), this.getMeta("publicKey")].includes(this.to());
	}

	public isTransfer(): boolean {
		return TransactionTypeIdentifier.isTransfer(this.data.data);
	}

	public isUsernameRegistration(): boolean {
		return TransactionTypeIdentifier.isUsernameRegistration(this.data.data);
	}

	public isUsernameResignation(): boolean {
		return TransactionTypeIdentifier.isUsernameResignation(this.data.data);
	}

	public isValidatorRegistration(): boolean {
		return TransactionTypeIdentifier.isValidatorRegistration(this.data.data);
	}

	public isUpdateValidator(): boolean {
		return TransactionTypeIdentifier.isUpdateValidator(this.data.data);
	}

	public isVote(): boolean {
		return TransactionTypeIdentifier.isVote(this.data.data);
	}

	public isUnvote(): boolean {
		return TransactionTypeIdentifier.isUnvote(this.data.data);
	}

	public isMultiPayment(): boolean {
		return TransactionTypeIdentifier.isMultiPayment(this.data.data);
	}

	public isValidatorResignation(): boolean {
		return TransactionTypeIdentifier.isValidatorResignation(this.data.data);
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

	public secondPublicKey(): string {
		return this.data.asset.signature.publicKey;
	}

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

	public methodHash(): string {
		return this.data.data.slice(0, 10);
	}

	public expirationType(): number {
		return this.data.asset.lock.expiration.type;
	}

	public expirationValue(): number {
		return this.data.asset.lock.expiration.value;
	}

	public normalizeData(): void {
		const { address } = this.#addressService.fromPublicKey(this.data.senderPublicKey);
		this.data.sender = address;
	}
}
