import { ConfirmedTransactionData } from "@/app/lib/mainsail/confirmed-transaction.dto";
import { Paginator } from "./paginator";
import { UnconfirmedTransactionData } from "./unconfirmed-transaction.dto";

export class ConfirmedTransactionDataCollection extends Paginator<ConfirmedTransactionData> {
	public findById(id: string): ConfirmedTransactionData | undefined {
		return this.#find("hash", id);
	}

	public findByType(type: string): ConfirmedTransactionData | undefined {
		return this.#find("type", type);
	}

	public findByTimestamp(timestamp: string): ConfirmedTransactionData | undefined {
		return this.#find("timestamp", timestamp);
	}

	public findBySender(sender: string): ConfirmedTransactionData | undefined {
		return this.#find("from", sender);
	}

	public findByRecipient(recipient: string): ConfirmedTransactionData | undefined {
		return this.#find("to", recipient);
	}

	#find(key: string, value: string): ConfirmedTransactionData | undefined {
		return this.items().find((transaction: ConfirmedTransactionData) => transaction[key]() === value);
	}
}