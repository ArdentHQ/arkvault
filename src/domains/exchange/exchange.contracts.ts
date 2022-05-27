import { Contracts } from "@payvo/sdk-profiles";

export interface ExchangeFormState {
	currencies: CurrencyData[];
	fromCurrency: CurrencyData;
	toCurrency: CurrencyData;
	payinAmount: number;
	payoutAmount: number;
	recipientWallet: string;
	refundExternalId: string;
	refundWallet: string;
	minPayinAmount: number;
	minPayoutAmount: number;
	externalId: string;
}

export interface CurrencyData {
	coin: string;
	name: string;
	image?: string;
	warnings?: object;
	hasExternalId?: boolean;
	externalIdName?: string;
	addressExplorerMask?: string;
	transactionExplorerMask?: string;
}

export interface EstimateResponse {
	estimatedAmount: number;
	estimatedTime?: string;
	warning?: any;
}

export interface Exchange {
	slug: string;
	name: string;
	termsOfService: string;
	privacyPolicy: string;
	emailAddress: string;
	isActive: boolean;
	logo: {
		dark: string;
		light: string;
		thumbnail: string;
	};
}

export interface Order {
	from: string;
	to: string;
	amount: number;
	address: string;
	externalId?: string;
	refundAddress?: string;
	refundExternalId?: string;
}

export interface OrderResponse {
	id: string;
	from: string;
	to: string;
	payinAddress: string;
	payoutAddress: string;
	amountFrom: number;
	amountTo: number;
	externalId: string;
}

export interface OrderStatusResponse {
	id: string;
	providerId: string;
	status: Contracts.ExchangeTransactionStatus;
	payinHash?: string;
	payoutHash?: string;
	payinAddress: string;
	payoutAddress: string;
	from: string;
	to: string;
	amountFrom?: number;
	amountTo?: number;
}
