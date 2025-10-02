import { Services } from "@/app/lib/mainsail";

import { IReadWriteWallet, ITransactionIndex, WalletData } from "./contracts.js";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection.js";
import { ExtendedConfirmedTransactionData } from "./transaction.dto.js";
import { transformConfirmedTransactionDataCollection, transformTransactionData } from "./transaction.mapper";
import { WalletFlag } from "./wallet.enum";
import { UnconfirmedTransactionDataCollection } from "@/app/lib/mainsail/unconfirmed-transactions.collection";

export class TransactionIndex implements ITransactionIndex {
	readonly #wallet: IReadWriteWallet;

	public constructor(wallet: IReadWriteWallet) {
		this.#wallet = wallet;
	}

	/** {@inheritDoc ITransactionIndex.all} */
	public async all(
		query: Services.ClientTransactionsInput = {},
	): Promise<ExtendedConfirmedTransactionDataCollection> {
		return this.#fetch({
			identifiers: [
				{
					method: this.#wallet.data().get(WalletData.ImportMethod),
					type: "address",
					value: this.#wallet.address(),
				},
			],
			...query,
		});
	}

	/** {@inheritDoc ITransactionIndex.sent} */
	public async sent(
		query: Services.ClientTransactionsInput = {},
	): Promise<ExtendedConfirmedTransactionDataCollection> {
		return this.#fetch({ from: this.#wallet.address(), ...query });
	}

	/** {@inheritDoc ITransactionIndex.received} */
	public async received(
		query: Services.ClientTransactionsInput = {},
	): Promise<ExtendedConfirmedTransactionDataCollection> {
		return this.#fetch({ to: this.#wallet.address(), ...query });
	}

	public async unconfirmed(
		query: Services.ClientTransactionsInput = {},
	): Promise<UnconfirmedTransactionDataCollection> {
		return await this.#wallet.client().unconfirmedTransactions(query);
	}

	/** {@inheritDoc ITransactionIndex.findById} */
	public async findById(hash: string): Promise<ExtendedConfirmedTransactionData> {
		return transformTransactionData(this.#wallet, await this.#wallet.client().transaction(hash));
	}

	/** {@inheritDoc ITransactionIndex.findByIds} */
	public async findByIds(hashes: string[]): Promise<ExtendedConfirmedTransactionData[]> {
		return Promise.all(hashes.map((hash: string) => this.findById(hash)));
	}

	async #fetch(query: Services.ClientTransactionsInput): Promise<ExtendedConfirmedTransactionDataCollection> {
		const result = await this.#wallet.client().transactions(query);

		const transactions = result.items();

		for (const transaction of transactions) {
			transaction.setMeta("address", this.#wallet.address());
			transaction.setMeta("publicKey", this.#wallet.publicKey());
		}

		if (this.#wallet.isCold() && transactions.some((t) => t.isSent() || t.isReturn())) {
			this.#wallet.data().set(WalletData.Status, WalletFlag.Hot);
		}

		return await transformConfirmedTransactionDataCollection(this.#wallet, result);
	}
}
