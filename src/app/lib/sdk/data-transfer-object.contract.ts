import { MetaPagination } from "./client.contract";
import { ConfirmedTransactionDataCollection } from "./collections";
import { ConfirmedTransactionData } from "./confirmed-transaction.dto.contract";
import { SignedTransactionData, WalletData } from "./contracts";

export interface DataTransferObjectService {
	signedTransaction(identifier: string, signedData: any, broadcastData?: any): SignedTransactionData;

	transaction(transaction: unknown): ConfirmedTransactionData;

	transactions(transactions: unknown[], meta: MetaPagination): ConfirmedTransactionDataCollection;

	wallet(wallet: unknown): WalletData;
}
