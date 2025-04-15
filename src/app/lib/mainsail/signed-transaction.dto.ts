import { Contracts, DTO } from "@/app/lib/sdk";
import { MultiPaymentItem } from "@/app/lib/sdk/confirmed-transaction.dto.contract";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import { Hex } from "viem";

import { AbiType, decodeFunctionData } from "./helpers/decode-function-data";
import { formatUnits } from "./helpers/format-units";
import { TransactionTypeService } from "./transaction-type.service";
import { RawTransactionData } from "@/app/lib/sdk/signed-transaction.dto.contract";
import { Address } from "@arkecosystem/typescript-crypto";

export class SignedTransactionData
	extends DTO.AbstractSignedTransactionData
	implements Contracts.SignedTransactionData
{
	public override configure(signedData: RawTransactionData, serialized: string) {
		this.identifier = signedData.id;
		this.signedData = signedData;
		this.serialized = serialized;
		this.signedData.senderAddress = Address.fromPublicKey(signedData.senderPublicKey);

		return this;
	}

	public override sender(): string {
		return this.signedData.senderAddress;
	}

	public override nonce(): BigNumber {
		return this.signedData.nonce;
	}

	public override recipient(): string {
		return this.signedData.recipientAddress;
	}

	public override amount(): BigNumber {
		if (this.isMultiPayment()) {
			return BigNumber.sum(this.payments().map(({ amount }) => amount));
		}

		return formatUnits(this.signedData.value, "ark");
	}

	public override fee(): BigNumber {
		const gasPrice = formatUnits(this.signedData.gasPrice, "ark");
		return gasPrice.times(this.signedData.gasLimit);
	}

	public override timestamp(): DateTime {
		if (this.signedData.timestamp) {
			return DateTime.make(this.signedData.timestamp);
		}

		return DateTime.make();
	}

	// Vote
	public override votes(): string[] {
		let data = this.signedData.data as string;

		if (!data.startsWith("0x")) {
			data = `0x${data}`;
		}

		const voteAddress = decodeFunctionData(data as Hex).args[0] as string;
		return [voteAddress];
	}

	public override unvotes(): string[] {
		return [];
	}

	public override isTransfer(): boolean {
		return TransactionTypeService.isTransfer(this.signedData);
	}

	public override isSecondSignature(): boolean {
		return false;
	}

	public override isUsernameRegistration(): boolean {
		return TransactionTypeService.isUsernameRegistration(this.signedData);
	}

	public override isUsernameResignation(): boolean {
		return TransactionTypeService.isUsernameResignation(this.signedData);
	}

	public override isValidatorRegistration(): boolean {
		return TransactionTypeService.isValidatorRegistration(this.signedData);
	}

	public override isVoteCombination(): boolean {
		return TransactionTypeService.isVoteCombination(this.signedData);
	}

	public override isVote(): boolean {
		return TransactionTypeService.isVote(this.signedData);
	}

	public override isUnvote(): boolean {
		return TransactionTypeService.isUnvote(this.signedData);
	}

	public override isMultiSignatureRegistration(): boolean {
		return TransactionTypeService.isMultiSignatureRegistration(this.signedData);
	}

	// Multi-Payment
	public override payments(): MultiPaymentItem[] {
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

	public override username(): string {
		return decodeFunctionData(this.normalizedData() as Hex, AbiType.Username).args[0] as string;
	}

	public override validatorPublicKey(): string {
		const key = decodeFunctionData(this.normalizedData() as Hex).args[0] as string;
		return key.slice(2); // removes 0x part
	}

	public override isMultiPayment(): boolean {
		return TransactionTypeService.isMultiPayment(this.signedData);
	}

	public override isValidatorResignation(): boolean {
		return TransactionTypeService.isValidatorResignation(this.signedData);
	}

	public override methodHash(): string {
		// Signed transactions do not have data prefixed with `0x`
		// that is why we are using first 8 chars to extract method.
		const methodName = this.signedData.data.slice(0, 8);

		return `0x${methodName}`;
	}

	public override usesMultiSignature(): boolean {
		return !!this.signedData.multiSignature;
	}

	public override toBroadcast() {
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
