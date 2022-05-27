import { Contracts, DTO } from "@payvo/sdk-profiles";

export interface TransactionTableProperties {
	transactions: DTO.ExtendedConfirmedTransactionData[];
	exchangeCurrency?: string;
	hideHeader?: boolean;
	onRowClick?: (row: DTO.ExtendedConfirmedTransactionData) => void;
	isLoading?: boolean;
	skeletonRowsLimit?: number;
	profile: Contracts.IProfile;
}

export interface Transaction {
	id: string;
	type: string;
	timestamp: string;
	confirmations: string;
	sender: string;
	recipient: string;
	recipients?: { amount: string; address: string }[];
	amount: string;
	fee: string;
	isSent: boolean;
	vendorField?: string;
	isUnvote?: boolean;
	isSignaturePending?: boolean;
	isMultiSignature?: boolean;
}

export type TransactionStatus = "confirmed" | "pending" | "actionRequired";
