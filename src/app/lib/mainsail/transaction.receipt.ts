import { BigNumber } from "@/app/lib/helpers";
import { Hex, hexToString } from "viem";
import { AbiDecoder, ContractAbiType } from "@arkecosystem/typescript-crypto";

interface ReceiptData {
	gasRefunded: number;
	gasUsed: number;
	status: number;
	gasLimit?: number;
	output?: string;
}

export class TransactionReceipt {
	#receipt: ReceiptData;
	#gasLimit: number;
	#insufficientGasThreshold: number = 0.95; // default

	constructor(receipt: ReceiptData, gasLimit: number = 0) {
		this.#receipt = receipt;
		this.#gasLimit = gasLimit;
	}

	public isSuccess(): boolean {
		return this.#receipt.status === 1;
	}

	public hasUnknownError(): boolean {
		if (this.isSuccess()) {
			return false;
		}

		if (this.hasInsufficientGasError()) {
			return false;
		}

		return !this.error();
	}

	public error(): string | undefined {
		if (this.isSuccess()) {
			return undefined;
		}

		const output = this.#receipt.output;

		if (!output || !hexToString(output as Hex)) {
			return undefined;
		}

		const contractAbiTypes = [
			ContractAbiType.CUSTOM,
			ContractAbiType.CONSENSUS,
			ContractAbiType.MULTIPAYMENT,
			ContractAbiType.USERNAMES,
		];

		for (const contractAbiType of contractAbiTypes) {
			try {
				return new AbiDecoder(contractAbiType).decodeError(output);
			} catch {
				// If the ABI type is not found, we will try the next one
			}
		}

		return undefined;
	}

	public hasInsufficientGasError(): boolean {
		if (!this.#gasLimit) {
			throw new Error("[TransactionReceipt#hasInsufficientGasError] Gas limit is not provided.");
		}

		const gasUsed = BigNumber.make(this.#receipt.gasUsed);
		const ratio = gasUsed.divide(this.#gasLimit).decimalPlaces(2).toNumber();

		return ratio > this.#insufficientGasThreshold;
	}
}
