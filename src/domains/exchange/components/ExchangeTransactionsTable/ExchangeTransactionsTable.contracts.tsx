import { Contracts } from "@payvo/sdk-profiles";

export interface ExchangeTransactionsTableProperties {
	exchangeTransactions: Contracts.IExchangeTransaction[];
	isCompact: boolean;
	onClick: (providerId: string, orderId: string) => void;
	onRemove: (exchangeTransaction: Contracts.IExchangeTransaction) => void;
}
