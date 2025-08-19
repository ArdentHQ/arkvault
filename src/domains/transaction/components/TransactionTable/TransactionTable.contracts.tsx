import { Contracts, DTO } from "@/app/lib/profiles";
import { SortBy } from "@/app/components/Table";

export type ExtendedTransactionDTO = DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;

export interface TransactionTableProperties {
	transactions: ExtendedTransactionDTO[];
	exchangeCurrency?: string;
	hideHeader?: boolean;
	onRowClick?: (row: ExtendedTransactionDTO) => void;
	isLoading?: boolean;
	skeletonRowsLimit?: number;
	profile: Contracts.IProfile;
	hideSender?: boolean;
	sortBy: SortBy;
	onSortChange: (column: string, desc: boolean) => void;
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
	isUnvote?: boolean;
	isSignaturePending?: boolean;
	isMultiSignature?: boolean;
}

export type TransactionStatus = "confirmed" | "pending" | "actionRequired";
