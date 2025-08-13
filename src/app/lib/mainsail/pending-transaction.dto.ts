import { Exceptions } from "@/app/lib/mainsail";
import type { UnconfirmedTransaction } from "./pending-transaction.contract";
import type { MultiPaymentItem } from "@/app/lib/mainsail/confirmed-transaction.dto.contract";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { UnitConverter } from "@arkecosystem/typescript-crypto";

import { AbiType, decodeFunctionData } from "./helpers/decode-function-data";
import { TransactionTypeService } from "./transaction-type.service";

export type KeyValuePair = Record<string, any>;

export class PendingTransactionData {
    #meta: Record<string, any> = {};
    protected decimals?: number;
    protected data!: UnconfirmedTransaction & { gasLimit?: number };

    protected createdAt: DateTime = DateTime.make(Date.now());

    public configure(data: UnconfirmedTransaction & { gasLimit?: number }) {
        this.data = data;
        return this;
    }

    public withDecimals(decimals?: number | string): this {
        this.decimals = typeof decimals === "string" ? Number.parseInt(decimals) : decimals;
        return this;
    }

    public setMeta(key: string, value: any): void {
        this.#meta[key] = value;
    }

    public getMeta<T = any>(key: string): T {
        return this.#meta[key] as T;
    }

    public hash(): string {
        return this.data.hash;
    }
    public nonce(): BigNumber {
        return BigNumber.make(this.data.nonce);
    }

    public from(): string {
        return this.data.from;
    }
    public to(): string {
        return this.data.to;
    }

    public value(): BigNumber {
        return BigNumber.make(UnitConverter.formatUnits(this.data.value, "ark"));
    }

    public fee(): BigNumber {
        const gas = this.data.gasLimit ?? this.data.gas;
        const gasPriceArk = BigNumber.make(UnitConverter.formatUnits(String(this.data.gasPrice), "ark"));
        return gasPriceArk.times(gas);
    }

    public type(): string {
        if (this.isVoteCombination()) return "voteCombination";

        if (this.isMultiPayment()) return "multiPayment";
        if (this.isSecondSignature()) return "secondSignature";
        if (this.isTransfer()) return "transfer";
        if (this.isUsernameRegistration()) return "usernameRegistration";
        if (this.isUsernameResignation()) return "usernameResignation";
        if (this.isUnvote()) return "unvote";
        if (this.isValidatorRegistration()) return "validatorRegistration";
        if (this.isValidatorResignation()) return "validatorResignation";
        if (this.isVote()) return "vote";
        if (this.isUpdateValidator()) return "updateValidator";

        const identifierName = TransactionTypeService.getIdentifierName(this.data as any);
        if (identifierName !== null) return identifierName;

        return this.methodHash();
    }

    public isTransfer(): boolean {
        return TransactionTypeService.isTransfer(this.data as any);
    }
    public isSecondSignature(): boolean {
        return false;
    }
    public isUsernameRegistration(): boolean {
        return TransactionTypeService.isUsernameRegistration(this.data as any);
    }
    public isUsernameResignation(): boolean {
        return TransactionTypeService.isUsernameResignation(this.data as any);
    }
    public isValidatorRegistration(): boolean {
        return TransactionTypeService.isValidatorRegistration(this.data as any);
    }
    public isUpdateValidator(): boolean {
        return TransactionTypeService.isUpdateValidator(this.data as any);
    }
    public isVoteCombination(): boolean {
        return TransactionTypeService.isVoteCombination(this.data as any);
    }
    public isVote(): boolean {
        return TransactionTypeService.isVote(this.data as any);
    }
    public isUnvote(): boolean {
        return TransactionTypeService.isUnvote(this.data as any);
    }
    public isMultiPayment(): boolean {
        return TransactionTypeService.isMultiPayment(this.data as any);
    }
    public isValidatorResignation(): boolean {
        return TransactionTypeService.isValidatorResignation(this.data as any);
    }

    // ---------- helpers for "sent/received/return" ----------
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
        return decodeFunctionData(this.data.data as `0x${string}`, AbiType.Username).args[0] as string;
    }

    public validatorPublicKey(): string {
        const key = decodeFunctionData(this.data.data as `0x${string}`).args[0] as string;
        return key.slice(2);
    }

    public votes(): string[] {
        const voteAddress = decodeFunctionData(this.data.data as `0x${string}`).args[0] as string;
        return [voteAddress];
    }

    public unvotes(): string[] {
        return [];
    }

    public payments(): MultiPaymentItem[] {
        if (!this.isMultiPayment()) return [];

        const payments: MultiPaymentItem[] = [];
        const [recipients, amounts] = decodeFunctionData(this.data.data as `0x${string}`, AbiType.MultiPayment).args;

        for (const index in recipients) {
            payments[index] = {
                amount: BigNumber.make(UnitConverter.formatUnits(amounts[index], "ark")),
                recipientId: recipients[index],
            };
        }
        return payments;
    }

    public recipients(): { address: string; amount: number }[] {
        if (!this.isMultiPayment()) return [];
        return this.payments().map((p) => ({ address: p.recipientId, amount: p.amount.toNumber() }));
    }

    public methodHash(): string {
        if (!this.data.data || this.data.data.length < 10) return this.data.data || "";
        return this.data.data.slice(0, 10);
    }

    public isSuccess(): boolean {
        return false;
    }
    public isConfirmed(): boolean {
        return false;
    }
    public confirmations(): BigNumber {
        return BigNumber.make(0);
    }

    public timestamp(): DateTime {
        return this.createdAt;
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
            timestamp: this.timestamp().toISOString(),
            value: this.value().toString(),
        };
    }

    public toHuman(): KeyValuePair {
        return {
            ...this.toObject(),
            fee: this.fee().toHuman?.() ?? this.fee().toString(),
            timestamp: this.timestamp().toISOString(),
            value: this.value().toHuman?.() ?? this.value().toString(),
        };
    }
}
