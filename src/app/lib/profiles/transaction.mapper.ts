import { Collections, Contracts } from "@ardenthq/sdk";

import { IReadWriteWallet } from "./contracts.js";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection.js";
import { ExtendedConfirmedTransactionData, ExtendedConfirmedTransactionDataType } from "./transaction.dto.js";

export const transformTransactionData = (
	wallet: IReadWriteWallet,
	transaction: ExtendedConfirmedTransactionDataType,
): ExtendedConfirmedTransactionData => new ExtendedConfirmedTransactionData(wallet, transaction);

export const transformConfirmedTransactionDataCollection = async (
	wallet: IReadWriteWallet,
	transactions: Collections.ConfirmedTransactionDataCollection,
): Promise<ExtendedConfirmedTransactionDataCollection> => {
	await Promise.allSettled(transactions.items().map((transaction) => transaction.normalizeData()));

	return new ExtendedConfirmedTransactionDataCollection(
		transactions
			.items()
			.map((transaction) => transformTransactionData(wallet, transaction as ExtendedConfirmedTransactionDataType)),
		transactions.getPagination(),
	);
};
