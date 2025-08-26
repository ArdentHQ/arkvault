import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";

import { ConfirmedTransactionDataCollection, UsernameDataCollection, WalletDataCollection } from "./collections";
import { EvmCallData, EvmCallResponse, KeyValuePair, SignedTransactionData, WalletData } from "./contracts";
import { TransactionType } from "./networks";
import { ConfirmedTransactionData } from "@/app/lib/mainsail/confirmed-transaction.dto";

export type ClientPaginatorCursor = string | number | undefined;

export interface MetaPagination {
	prev: ClientPaginatorCursor;
	self: ClientPaginatorCursor;
	next: ClientPaginatorCursor;
	last: ClientPaginatorCursor;
}

export interface BroadcastResponse {
	accepted: string[];
	rejected: string[];
	errors: Record<string, string>;
}

export interface WalletIdentifier {
	type: "address" | "publicKey" | "extendedPublicKey" | "username";
	value: string;
	method?: "bip39" | "bip44" | "bip49" | "bip84";
	networkId?: string;
}

export interface ClientService {
	transaction(id: string): Promise<ConfirmedTransactionData>;
	transactions(query: ClientTransactionsInput): Promise<ConfirmedTransactionDataCollection>;

	wallet(id: WalletIdentifier, options?: object): Promise<WalletData>;
	wallets(query: ClientWalletsInput): Promise<WalletDataCollection>;

	validator(id: string): Promise<WalletData>;
	validators(query?: ClientWalletsInput): Promise<WalletDataCollection>;

	votes(id: string): Promise<VoteReport>;
	// TODO: return struct like VoteReport
	voters(id: string, query?: KeyValuePair): Promise<WalletDataCollection>;

	unlockableBalances(id: string): Promise<UnlockTokenResponse>;

	broadcast(transactions: SignedTransactionData[]): Promise<BroadcastResponse>;

	evmCall(callData: EvmCallData): Promise<EvmCallResponse>;

	usernames(addresses: string[]): Promise<UsernameDataCollection>;
}

export interface ClientPagination {
	cursor?: string | number;
	limit?: number;
	orderBy?: string;
}

export interface RangeCriteria {
	from?: number;
	to?: number;
}

export interface ClientTransactionsInput extends ClientPagination {
	// Addresses
	identifiers?: WalletIdentifier[];
	from?: string;
	to?: string;
	// Public Keys
	senderPublicKey?: string;
	recipientPublicKey?: string;
	// Meta
	asset?: Record<string, any>;
	memo?: string;
	timestamp?: RangeCriteria;
	// Transaction Types
	type?: TransactionType;
	types?: TransactionType[];
	fullReceipt?: boolean;
}

export interface ClientWalletsInput extends ClientPagination {
	identifiers?: WalletIdentifier[];
}

// TODO: move
export interface VoteReport {
	used: number;
	available: number;
	votes: { id: string; amount: number }[];
}

export interface TransactionDetailInput {
	walletId?: string;
}

// Only supported by Lisk at the moment
export interface UnlockableBalance {
	address: string;
	amount: BigNumber;
	height: string;
	timestamp: DateTime;
	isReady: boolean;
}

export interface UnlockTokenResponse {
	objects: UnlockableBalance[];
	current: BigNumber;
	pending: BigNumber;
}
