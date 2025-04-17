import { UUID } from "@ardenthq/sdk-cryptography";

import {
	ExchangeTransactionDetail,
	ExchangeTransactionStatus,
	IExchangeTransaction,
	IExchangeTransactionData,
	IExchangeTransactionInput,
	IExchangeTransactionRepository,
	IProfile,
} from "./contracts.js";
import { DataRepository } from "./data.repository";
import { ExchangeTransaction } from "./exchange-transaction.js";

export class ExchangeTransactionRepository implements IExchangeTransactionRepository {
	readonly #profile: IProfile;
	readonly #data: DataRepository = new DataRepository();

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IExchangeTransactionRepository.all} */
	public all(): Record<string, IExchangeTransaction> {
		return this.#data.all() as Record<string, IExchangeTransaction>;
	}

	/** {@inheritDoc IExchangeTransactionRepository.keys} */
	public keys(): string[] {
		return this.#data.keys();
	}

	/** {@inheritDoc IExchangeTransactionRepository.values} */
	public values(): IExchangeTransaction[] {
		return this.#data.values();
	}

	/** {@inheritDoc IExchangeTransactionRepository.create} */
	public create(data: IExchangeTransactionInput): IExchangeTransaction {
		const exchangeTransactions: IExchangeTransaction[] = this.values();

		for (const exchangeTransaction of exchangeTransactions) {
			if (exchangeTransaction.orderId() === data.orderId && exchangeTransaction.provider() === data.provider) {
				throw new Error(`The exchange transaction [${data.provider} / ${data.orderId}] already exists.`);
			}
		}

		const id: string = UUID.random();

		const result: IExchangeTransaction = new ExchangeTransaction({ id, ...data }, this.#profile);

		this.#data.set(id, result);

		this.#profile.status().markAsDirty();

		return result;
	}

	/** {@inheritDoc IExchangeTransactionRepository.findById} */
	public findById(id: string): IExchangeTransaction {
		const exchangeTransaction: IExchangeTransaction | undefined = this.#data.get(id);

		if (!exchangeTransaction) {
			throw new Error(`Failed to find an exchange transaction for [${id}].`);
		}

		return exchangeTransaction;
	}

	/** {@inheritDoc IExchangeTransactionRepository.findByStatus} */
	public findByStatus(status: ExchangeTransactionStatus): IExchangeTransaction[] {
		return this.values().filter(
			(exchangeTransaction: IExchangeTransaction) => exchangeTransaction.status() === status,
		);
	}

	/** {@inheritDoc IExchangeTransactionRepository.pending} */
	public pending(): IExchangeTransaction[] {
		return this.values().filter((exchangeTransaction: IExchangeTransaction) => exchangeTransaction.isPending());
	}

	/** {@inheritDoc IExchangeTransactionRepository.update} */
	public update(
		id: string,
		data: {
			input?: ExchangeTransactionDetail;
			output?: ExchangeTransactionDetail;
			status?: ExchangeTransactionStatus;
		},
	): void {
		const result = this.findById(id);

		if (data.input) {
			result.setInput(data.input);
		}

		if (data.output) {
			result.setOutput(data.output);
		}

		if (data.status) {
			result.setStatus(data.status);
		}

		this.#data.set(id, result);

		this.#profile.status().markAsDirty();
	}

	/** {@inheritDoc IExchangeTransactionRepository.forget} */
	public forget(id: string): void {
		this.findById(id);

		this.#data.forget(id);

		this.#profile.status().markAsDirty();
	}

	/** {@inheritDoc IExchangeTransactionRepository.flush} */
	public flush(): void {
		this.#data.flush();

		this.#profile.status().markAsDirty();
	}

	/** {@inheritDoc IExchangeTransactionRepository.count} */
	public count(): number {
		return this.keys().length;
	}

	/** {@inheritDoc IExchangeTransactionRepository.toObject} */
	public toObject(): Record<string, IExchangeTransactionData> {
		const result: Record<string, IExchangeTransactionData> = {};

		for (const [id, exchangeTransaction] of Object.entries(
			this.#data.all() as Record<string, IExchangeTransaction>,
		)) {
			result[id] = exchangeTransaction.toObject();
		}

		return result;
	}

	/** {@inheritDoc IExchangeTransactionRepository.fill} */
	public fill(exchangeTransactions: Record<string, IExchangeTransactionData>): void {
		for (const [id, exchangeTransactionData] of Object.entries(exchangeTransactions)) {
			const exchangeTransaction: IExchangeTransaction = new ExchangeTransaction(
				exchangeTransactionData,
				this.#profile,
			);

			this.#data.set(id, exchangeTransaction);
		}
	}
}
