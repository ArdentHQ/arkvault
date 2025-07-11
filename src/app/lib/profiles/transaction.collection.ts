import { Paginator } from "@/app/lib/mainsail/paginator";
import { ExtendedConfirmedTransactionData } from "./transaction.dto.js";

export class ExtendedConfirmedTransactionDataCollection extends Paginator<ExtendedConfirmedTransactionData> {
	public findById(hash: string): ExtendedConfirmedTransactionData | undefined {
		return this.#find("hash", hash);
	}

	public findByType(type: string): ExtendedConfirmedTransactionData | undefined {
		return this.#find("type", type);
	}

	public findByTimestamp(timestamp: string): ExtendedConfirmedTransactionData | undefined {
		return this.#find("timestamp", timestamp);
	}

	public findBySender(from: string): ExtendedConfirmedTransactionData | undefined {
		return this.#find("from", from);
	}

	public findByRecipient(to: string): ExtendedConfirmedTransactionData | undefined {
		return this.#find("to", to);
	}

	#find(key: string, value: string): ExtendedConfirmedTransactionData | undefined {
		return this.items().find((transaction: ExtendedConfirmedTransactionData) => transaction[key]() === value);
	}
}
