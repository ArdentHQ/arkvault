import { Coins, Services } from "@ardenthq/sdk";

import { IReadWriteWallet, ITransactionIndex, WalletData } from "./contracts.js";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection.js";
import { ExtendedConfirmedTransactionData } from "./transaction.dto.js";
import { transformConfirmedTransactionDataCollection, transformTransactionData } from "./transaction.mapper";
import { WalletFlag } from "./wallet.enum";

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
		return this.#fetch({ senderId: this.#wallet.address(), ...query });
	}

	/** {@inheritDoc ITransactionIndex.received} */
	public async received(
		query: Services.ClientTransactionsInput = {},
	): Promise<ExtendedConfirmedTransactionDataCollection> {
		return this.#fetch({ recipientId: this.#wallet.address(), ...query });
	}

	/** {@inheritDoc ITransactionIndex.findById} */
	public async findById(id: string): Promise<ExtendedConfirmedTransactionData> {
		return transformTransactionData(
			this.#wallet,
			await this.#wallet.getAttributes().get<Coins.Coin>("coin").client().transaction(id),
		);
	}

	/** {@inheritDoc ITransactionIndex.findByIds} */
	public async findByIds(ids: string[]): Promise<ExtendedConfirmedTransactionData[]> {
		return Promise.all(ids.map((id: string) => this.findById(id)));
	}

	async #fetch(query: Services.ClientTransactionsInput): Promise<ExtendedConfirmedTransactionDataCollection> {
		const result = await this.#wallet.getAttributes().get<Coins.Coin>("coin").client().transactions(query);

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
