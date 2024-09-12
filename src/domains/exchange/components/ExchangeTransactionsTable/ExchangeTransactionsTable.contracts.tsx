import { Contracts } from "@ardenthq/sdk-profiles";

export interface ExchangeTransactionsTableProperties {
	exchangeTransactions: Contracts.IExchangeTransaction[];
	onClick: (providerId: string, orderId: string) => void;
	onRemove: (exchangeTransaction: Contracts.IExchangeTransaction) => void;
}
