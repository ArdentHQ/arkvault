import { BigNumber } from "@/app/lib/helpers";

interface ReceiptData {
	gasRefunded: number;
	gasUsed: number;
	status: number;
	gasLimit?: number;
	output?: string;
	decodedError?: string;
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

		const error = this.error();

		if (error === "execution reverted") {
			return true;
		}

		return !error;
	}

	public error(): string | undefined {
		if (this.isSuccess()) {
			return undefined;
		}

		return this.#receipt.decodedError;
	}

	public prettyError(): string | undefined {
		const error = this.error();

		if (!error) {
			return undefined;
		}

		// Special case: execution reverted with high gas usage likely indicates out of gas
		if (error === "execution reverted" && this.hasInsufficientGasError()) {
			return "Out of gas?";
		}

		// Handle errors with no spaces (TakenUsername) - split on caps
		if (error.indexOf(" ") === -1) {
			return error.replace(/([A-Z])/g, " $1");
		}

		// Handle errors with spaces - capitalize the first letter
		return error.replace(/^./, error[0].toUpperCase());
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
