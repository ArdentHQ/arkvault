import { Exceptions } from "@/app/lib/mainsail";
import { TransactionData, KeyValuePair } from "./transaction-data.dto";
import { BigNumber } from "@/app/lib/helpers";
import { TransactionReceipt } from "./transaction.receipt";

export class ConfirmedTransactionData extends TransactionData {
	public publicKeys(): string[] {
		throw new Exceptions.NotImplemented(this.constructor.name, this.publicKeys.name);
	}

	public min(): number {
		throw new Exceptions.NotImplemented(this.constructor.name, this.min.name);
	}

	public confirmations(): BigNumber {
		return BigNumber.make(this.data.confirmations);
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
		return {
			...super.toHuman(),
			confirmations: this.confirmations().toString(),
		};
	}

	public isSuccess(): boolean {
		return this.data.receipt.status === 1;
	}

	public receipt(): TransactionReceipt {
		return new TransactionReceipt(this.data.receipt, this.data.gas);
	}

	public isConfirmed(): boolean {
		return this.confirmations().isGreaterThanOrEqualTo(1);
	}

	public gasLimit(): number {
		return this.data.gas;
	}

	public gasUsed(): number {
		return this.data.receipt.gasUsed;
	}
}
