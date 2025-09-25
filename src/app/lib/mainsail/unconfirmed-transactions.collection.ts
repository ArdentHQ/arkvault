import { UnconfirmedTransactionData } from "./unconfirmed-transaction.dto";
import { Paginator } from "./paginator";

export class UnconfirmedTransactionDataCollection extends Paginator<UnconfirmedTransactionData> {
	public findById(id: string): UnconfirmedTransactionData | undefined {
		return this.#find("hash", id);
	}

	public findByType(type: string): UnconfirmedTransactionData | undefined {
		return this.#find("type", type);
	}

	public findByTimestamp(timestamp: string): UnconfirmedTransactionData | undefined {
		return this.#find("timestamp", timestamp);
	}

	public findBySender(sender: string): UnconfirmedTransactionData | undefined {
		return this.#find("from", sender);
	}

	public findByRecipient(recipient: string): UnconfirmedTransactionData | undefined {
		return this.#find("to", recipient);
	}

	#find(key: string, value: string): UnconfirmedTransactionData | undefined {
		return this.items().find((transaction: UnconfirmedTransactionData) => transaction[key]() === value);
	}
}
