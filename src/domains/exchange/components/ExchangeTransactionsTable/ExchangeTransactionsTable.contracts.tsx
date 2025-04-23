import { Contracts } from "@/app/lib/profiles";

export interface ExchangeTransactionsTableProperties {
	exchangeTransactions: Contracts.IExchangeTransaction[];
	onClick: (providerId: string, orderId: string) => void;
	onRemove: (exchangeTransaction: Contracts.IExchangeTransaction) => void;
}
