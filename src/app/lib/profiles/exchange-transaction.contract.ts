import { ExchangeTransactionStatus } from "./exchange-transaction.enum";

export interface ExchangeTransactionDetail {
	address: string;
	amount: number;
	hash?: string;
	ticker: string;
}

/**
 * Defines the input that is needed for creating an exchange transaction.
 *
 * @export
 * @interface IExchangeTransactionInput
 */
export interface IExchangeTransactionInput {
	orderId: string;
	input: ExchangeTransactionDetail;
	output: ExchangeTransactionDetail;
	provider: string;
}

/**
 * Defines the structure that represents an exchange transaction.
 *
 * @export
 * @interface IExchangeTransactionData
 */
export interface IExchangeTransactionData {
	id: string;
	orderId: string;
	provider: string;
	input: ExchangeTransactionDetail;
	output: ExchangeTransactionDetail;
	createdAt?: number;
	status?: ExchangeTransactionStatus;
}

/**
 * Defines the implementation contract for an exchange transaction.
 *
 * @export
 * @interface IExchangeTransaction
 */
export interface IExchangeTransaction {
	/**
	 * Get the ID.
	 *
	 * @return {string}
	 * @memberof IExchangeTransaction
	 */
	id(): string;

	/**
	 * Get the order ID.
	 *
	 * @return {string}
	 * @memberof IExchangeTransaction
	 */
	orderId(): string;

	/**
	 * Get the provider.
	 *
	 * @return {string}
	 * @memberof IExchangeTransaction
	 */
	provider(): string;

	/**
	 * Get the input details.
	 *
	 * @return {ExchangeTransactionDetail}
	 * @memberof IExchangeTransaction
	 */
	input(): ExchangeTransactionDetail;

	/**
	 * Set the input details.
	 *
	 * @param {ExchangeTransactionDetail} input
	 * @memberof IExchangeTransaction
	 */
	setInput(input: ExchangeTransactionDetail): void;

	/**
	 * Get the output details.
	 *
	 * @return {number}
	 * @memberof IExchangeTransaction
	 */
	output(): ExchangeTransactionDetail;

	/**
	 * Set the output details.
	 *
	 * @param {ExchangeTransactionDetail} output
	 * @memberof IExchangeTransaction
	 */
	setOutput(output: ExchangeTransactionDetail): void;

	/**
	 * Get the status.
	 *
	 * @return {ExchangeTransactionStatus}
	 * @memberof IExchangeTransaction
	 */
	status(): ExchangeTransactionStatus;

	/**
	 * Set the status.
	 *
	 * @param {ExchangeTransactionStatus} status
	 * @memberof IExchangeTransaction
	 */
	setStatus(status: ExchangeTransactionStatus): void;

	/**
	 * Check if an exchange transaction is expired.
	 *
	 * @return {boolean}
	 * @memberof IExchangeTransaction
	 */
	isExpired(): boolean;

	/**
	 * Check if an exchange transaction has failed.
	 *
	 * @return {boolean}
	 * @memberof IExchangeTransaction
	 */
	isFailed(): boolean;

	/**
	 * Check if an exchange transaction is finished.
	 *
	 * @return {boolean}
	 * @memberof IExchangeTransaction
	 */
	isFinished(): boolean;

	/**
	 * Check if an exchange transaction is pending.
	 *
	 * @return {boolean}
	 * @memberof IExchangeTransaction
	 */
	isPending(): boolean;

	/**
	 * Check if an exchange transaction has been refunded.
	 *
	 * @return {boolean}
	 * @memberof IExchangeTransaction
	 */
	isRefunded(): boolean;

	/**
	 * Get the timestamp.
	 *
	 * @return {number}
	 * @memberof IExchangeTransaction
	 */
	createdAt(): number;

	/**
	 * Turn the exchange transcation into a normalised object.
	 *
	 * @return {IExchangeTransactionData}
	 * @memberof IExchangeTransaction
	 */
	toObject(): IExchangeTransactionData;
}
