import { TransactionData, KeyValuePair } from "./transaction-data.dto";

export class UnconfirmedTransactionData extends TransactionData {
	public toObject(): KeyValuePair {
		return {
			...super.toObject(),
			status: "pending",
		};
	}

	public toJSON(): KeyValuePair {
		return {
			...super.toJSON(),
			status: "pending",
		};
	}

	public toHuman(): KeyValuePair {
		return {
			...super.toHuman(),
			status: "pending",
		};
	}

	public isConfirmed(): boolean {
		return false;
	}

	public isPending(): boolean {
		return true;
	}
}
