import { MultiPaymentItem } from "@/app/lib/sdk/confirmed-transaction.dto.contract";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { Hex } from "viem";

import { AbiType, decodeFunctionData } from "./helpers/decode-function-data";
import { formatUnits } from "./helpers/format-units";
import { TransactionTypeService } from "./transaction-type.service";
import { RawTransactionData } from "@/app/lib/sdk/signed-transaction.dto.contract";
import { Address } from "@arkecosystem/typescript-crypto";

export class SignedTransactionData  {
	protected identifier!: string;
	protected signedData!: RawTransactionData;
	protected serialized!: string;

	public configure(signedData: RawTransactionData, serialized: string) {
		this.identifier = signedData.hash;
		this.signedData = signedData;
		this.serialized = serialized;

		if (!this.signedData.from) {
			this.signedData.from = Address.fromPublicKey(signedData.senderPublicKey);
		}

		return this;
	}

	public from(): string {
		return this.signedData.from;
	}

	public nonce(): BigNumber {
		return this.signedData.nonce;
	}

	public to(): string {
		return this.signedData.to;
	}

	public value(): BigNumber {
		if (this.isMultiPayment()) {
			return BigNumber.sum(this.payments().map(({ amount }) => amount));
		}

		return formatUnits(this.signedData.value, "ark");
	}

	public fee(): BigNumber {
		const gasPrice = formatUnits(this.signedData.gasPrice, "ark");
		return gasPrice.times(this.signedData.gas);
	}

	public timestamp(): DateTime {
		if (this.signedData.timestamp) {
			return DateTime.make(this.signedData.timestamp);
		}

		return DateTime.make();
	}

	// Vote
	public votes(): string[] {
		let data = this.signedData.data as string;

		if (!data.startsWith("0x")) {
			data = `0x${data}`;
		}

		const voteAddress = decodeFunctionData(data as Hex).args[0] as string;
		return [voteAddress];
	}

	public unvotes(): string[] {
		return [];
	}

	public isTransfer(): boolean {
		return TransactionTypeService.isTransfer(this.signedData);
	}

	public isSecondSignature(): boolean {
		return false;
	}

	public isUsernameRegistration(): boolean {
		return TransactionTypeService.isUsernameRegistration(this.signedData);
	}

	public isUsernameResignation(): boolean {
		return TransactionTypeService.isUsernameResignation(this.signedData);
	}

	public isValidatorRegistration(): boolean {
		return TransactionTypeService.isValidatorRegistration(this.signedData);
	}

	public isVoteCombination(): boolean {
		return TransactionTypeService.isVoteCombination(this.signedData);
	}

	public isVote(): boolean {
		return TransactionTypeService.isVote(this.signedData);
	}

	public isUnvote(): boolean {
		return TransactionTypeService.isUnvote(this.signedData);
	}

	// Multi-Payment
	public payments(): MultiPaymentItem[] {
		const payments: MultiPaymentItem[] = [];

		const [recipients, amounts] = decodeFunctionData(this.normalizedData() as Hex, AbiType.MultiPayment).args;

		for (const index in recipients) {
			payments[index] = {
				amount: formatUnits(amounts[index], "ark"),
				recipientId: recipients[index],
			};
		}

		return payments;
	}

	public username(): string {
		return decodeFunctionData(this.normalizedData() as Hex, AbiType.Username).args[0] as string;
	}

	public validatorPublicKey(): string {
		const key = decodeFunctionData(this.normalizedData() as Hex).args[0] as string;
		return key.slice(2); // removes 0x part
	}

	public isMultiPayment(): boolean {
		return TransactionTypeService.isMultiPayment(this.signedData);
	}

	public isValidatorResignation(): boolean {
		return TransactionTypeService.isValidatorResignation(this.signedData);
	}

	public methodHash(): string {
		// Signed transactions do not have data prefixed with `0x`
		// that is why we are using first 8 chars to extract method.
		const methodName = this.signedData.data.slice(0, 8);

		return `0x${methodName}`;
	}

	public toBroadcast() {
		return this.serialized;
	}

	private normalizedData() {
		let data = this.signedData.data as string;

		if (!data.startsWith("0x")) {
			data = `0x${data}`;
		}

		return data;
	}
}
