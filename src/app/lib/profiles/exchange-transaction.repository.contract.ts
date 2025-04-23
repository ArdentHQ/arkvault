import {
	ExchangeTransactionStatus,
	IExchangeTransaction,
	IExchangeTransactionData,
	IExchangeTransactionInput,
} from "./contracts.js";

/**
 * Defines the implementation contract for the exchange transaction repository.
 *
 * @export
 * @interface IExchangeTransaction
 */
export interface IExchangeTransactionRepository {
	/**
	 * Get all keys and values.
	 *
	 * @returns {Record<string, IExchangeTransaction>}
	 * @memberof IExchangeTransactionRepository
	 */
	all(): Record<string, IExchangeTransaction>;

	/**
	 * Get all keys.
	 *
	 * @returns {string[]}
	 * @memberof IExchangeTransactionRepository
	 */
	keys(): string[];

	/**
	 * Get all values.
	 *
	 * @returns {IExchangeTransaction[]}
	 * @memberof IExchangeTransactionRepository
	 */
	values(): IExchangeTransaction[];

	/**
	 * Create a new exchange transaction.
	 *
	 * @param {IExchangeTransactionInput} data
	 * @returns {IExchangeTransaction}
	 * @memberof IExchangeTransactionRepository
	 */
	create(data: IExchangeTransactionInput): IExchangeTransaction;

	/**
	 * Fill the storage with exchange transaction data.
	 *
	 * @param {Record<string, IExchangeTransactionData>} exchangeTransactions
	 * @memberof IExchangeTransactionRepository
	 */
	fill(exchangeTransactions: Record<string, IExchangeTransactionData>): void;

	/**
	 * Find an exchange transaction by its ID.
	 *
	 * @param {string} id
	 * @returns {IExchangeTransaction}
	 * @memberof IExchangeTransactionRepository
	 */
	findById(id: string): IExchangeTransaction;

	/**
	 * Find many exchange transactions by their status.
	 *
	 * @param {ExchangeTransactionStatus} status
	 * @returns {IExchangeTransaction[]}
	 * @memberof IExchangeTransactionRepository
	 */
	findByStatus(status: ExchangeTransactionStatus): IExchangeTransaction[];

	/**
	 * Find many pending transactions.
	 *
	 * @returns {IExchangeTransaction[]}
	 * @memberof IExchangeTransactionRepository
	 */
	pending(): IExchangeTransaction[];

	/**
	 * Update an exchange transaction.
	 *
	 * @param {string} id
	 * @param {{ status?: ExchangeTransactionStatus }} data
	 * @returns {void}
	 * @memberof IExchangeTransactionRepository
	 */
	update(id: string, data: { status?: ExchangeTransactionStatus }): void;

	/**
	 * Remove an exchange transaction by its ID.
	 *
	 * @param {string} id
	 * @memberof IExchangeTransactionRepository
	 */
	forget(id: string): void;

	/**
	 * Remove all exchange transactions.
	 *
	 * @memberof IExchangeTransactionRepository
	 */
	flush(): void;

	/**
	 * Count how many exchange transactions there are.
	 *
	 * @returns {number}
	 * @memberof IExchangeTransactionRepository
	 */
	count(): number;

	/**
	 * Turn the exchange transactions into a normalised object.
	 *
	 * @returns {Record<string, IExchangeTransaction>}
	 * @memberof IExchangeTransactionRepository
	 */
	toObject(): Record<string, IExchangeTransactionData>;
}
