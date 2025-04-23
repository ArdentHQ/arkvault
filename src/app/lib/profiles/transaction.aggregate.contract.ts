import { Services } from "@ardenthq/sdk";

import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection.js";

export type AggregateQuery = {
	identifiers?: Services.WalletIdentifier[];
	types?: string[];
	senderId?: string;
	recipientId?: string;
} & Services.ClientPagination;

/**
 * Defines the implementation contract for the transaction aggregate.
 *
 * @export
 * @interface ITransactionAggregate
 */
export interface ITransactionAggregate {
	/**
	 * Aggregate sent and received transactions using the given query.
	 *
	 * @param {AggregateQuery} query
	 * @return {Promise<ExtendedConfirmedTransactionDataCollection>}
	 * @memberof ITransactionAggregate
	 */
	all(query: AggregateQuery): Promise<ExtendedConfirmedTransactionDataCollection>;

	/**
	 * Aggregate sent transactions using the given query.
	 *
	 * @param {AggregateQuery} query
	 * @return {Promise<ExtendedConfirmedTransactionDataCollection>}
	 * @memberof ITransactionAggregate
	 */
	sent(query: AggregateQuery): Promise<ExtendedConfirmedTransactionDataCollection>;

	/**
	 * Aggregate received transactions using the given query.
	 *
	 * @param {AggregateQuery} query
	 * @return {Promise<ExtendedConfirmedTransactionDataCollection>}
	 * @memberof ITransactionAggregate
	 */
	received(query: AggregateQuery): Promise<ExtendedConfirmedTransactionDataCollection>;

	/**
	 * Determines if there are more transactions for the given method.
	 *
	 * @param {string} method
	 * @return {boolean}
	 * @memberof ITransactionAggregate
	 */
	hasMore(method: string): boolean;

	/**
	 * Remove all transactions that have been aggregated.
	 *
	 * @param {string} method
	 * @memberof ITransactionAggregate
	 */
	flush(method: string): void;
}
