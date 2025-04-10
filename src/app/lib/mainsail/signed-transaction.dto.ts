import { Contracts, DTO, Exceptions, IoC } from "@/app/lib/sdk";
import { MultiPaymentItem } from "@/app/lib/sdk/confirmed-transaction.dto.contract";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import { Utils } from "@mainsail/crypto-transaction";
import { Application } from "@mainsail/kernel";
import { Hex } from "viem";

import { BindingType } from "./coin.contract";
import { Hash } from "./crypto/hash";
import { AbiType, decodeFunctionData } from "./helpers/decode-function-data";
import { formatUnits } from "./helpers/format-units";
import { TransactionTypeService } from "./transaction-type.service";

export class SignedTransactionData
	extends DTO.AbstractSignedTransactionData
	implements Contracts.SignedTransactionData
{
	#app: Application;

	public constructor(container: IoC.Container) {
		super(container);

		this.#app = container.get(BindingType.Application);
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

		return this.bigNumberService.make(this.signedData.value);
	}

	public override fee(): BigNumber {
		const gasPrice = formatUnits(this.signedData.gasPrice, "ark");
		return gasPrice.times(this.signedData.gasLimit);
	}

	public override memo(): string | undefined {
		return this.signedData.vendorField;
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

	public override isDelegateRegistration(): boolean {
		return this.isValidatorRegistration();
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

	public override isIpfs(): boolean {
		return false;
	}

	public override isMultiPayment(): boolean {
		return TransactionTypeService.isMultiPayment(this.signedData);
	}

	public override isDelegateResignation(): boolean {
		return this.isValidatorResignation();
	}

	public override isValidatorResignation(): boolean {
		return TransactionTypeService.isValidatorResignation(this.signedData);
	}

	public override isHtlcLock(): boolean {
		throw new Exceptions.NotImplemented(this.constructor.name, this.isHtlcLock.name);
	}

	public override isHtlcClaim(): boolean {
		throw new Exceptions.NotImplemented(this.constructor.name, this.isHtlcClaim.name);
	}

	public override isHtlcRefund(): boolean {
		throw new Exceptions.NotImplemented(this.constructor.name, this.isHtlcRefund.name);
	}

	public override isMagistrate(): boolean {
		return TransactionTypeService.isMagistrate(this.signedData);
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

	public override async toBroadcast() {
		const serialized = await this.#app.resolve(Utils).toBytes(this.broadcastData);

		return serialized.toString("hex");
	}

	public async generateHash(options: { excludeMultiSignature?: boolean } = {}) {
		return this.#app.resolve(Utils).toHash(this.signedData, {
			excludeMultiSignature: options?.excludeMultiSignature ?? true,
			excludeSignature: true,
		});
	}

	public override async sanitizeSignatures(): Promise<void> {
		const transaction = this.signedData;

		const validSignatures: string[] = [];
		const signatures: string[] = this.signedData.signatures ?? ([] as string[]);

		for (const signature of signatures) {
			const publicKeyIndex: number = Number.parseInt(signature.slice(0, 2), 16);
			const partialSignature: string = signature.slice(2, 130);
			const publicKey: string = transaction.multiSignature.publicKeys[publicKeyIndex];

			const hash = await this.generateHash();

			const isValid = Hash.verifySchnorr(hash, partialSignature, publicKey);

			if (isValid) {
				validSignatures.push(signature);
			}
		}

		transaction.signatures = validSignatures;

		if (transaction.signature) {
			const hash = await this.generateHash({ excludeMultiSignature: false });
			const isValid = Hash.verifySchnorr(hash, transaction.signature, transaction.senderPublicKey);

			if (!isValid) {
				transaction.signature = undefined;
			}
		}
	}

	private normalizedData() {
		let data = this.signedData.data as string;

		if (!data.startsWith("0x")) {
			data = `0x${data}`;
		}

		return data;
	}
}
