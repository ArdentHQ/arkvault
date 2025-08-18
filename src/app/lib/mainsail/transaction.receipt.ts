import { BigNumber } from "@/app/lib/helpers";

interface ReceiptData {
	gasRefunded: number;
	gasUsed: number;
	status: number;
	gasLimit?: number;
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

		return true;
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
