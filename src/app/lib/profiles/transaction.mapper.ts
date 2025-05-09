import { Collections } from "@/app/lib/sdk";

import { IReadWriteWallet } from "./contracts.js";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection.js";
import { ExtendedConfirmedTransactionData } from "./transaction.dto.js";
import { ConfirmedTransactionData } from "@/app/lib/mainsail/confirmed-transaction.dto.js";

export const transformTransactionData = (
	wallet: IReadWriteWallet,
	transaction: ConfirmedTransactionData,
): ExtendedConfirmedTransactionData => new ExtendedConfirmedTransactionData(wallet, transaction);

export const transformConfirmedTransactionDataCollection = async (
	wallet: IReadWriteWallet,
	transactions: Collections.ConfirmedTransactionDataCollection,
): Promise<ExtendedConfirmedTransactionDataCollection> => {
	await Promise.allSettled(transactions.items().map((transaction) => transaction.normalizeData()));

	return new ExtendedConfirmedTransactionDataCollection(
		transactions
			.items()
			.map((transaction: ConfirmedTransactionData) => transformTransactionData(wallet, transaction)),
		transactions.getPagination(),
	);
};
