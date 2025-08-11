import { Contracts, DTO, Contracts as ProfileContracts } from "@/app/lib/profiles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSynchronizer, useWalletAlias } from "@/app/hooks";
import { usePendingTransactions } from "@/domains/transaction/hooks/use-pending-transactions";

import { SortBy } from "@/app/components/Table";
import { delay } from "@/utils/delay";
import { useTransactionTypes } from "./use-transaction-types";
import { DateTime } from "@/app/lib/intl";

interface TransactionsState {
	transactions: DTO.ExtendedConfirmedTransactionData[];
	isLoadingTransactions: boolean;
	isLoadingMore: boolean;
	activeMode?: string;
	activeTransactionType?: any;
	selectedTransactionTypes: string[];
	hasMore?: boolean;
	timestamp?: number;
}

interface TransactionFilters {
	activeMode?: string;
	activeTransactionType?: any;
	selectedTransactionTypes?: string[];
	timestamp?: number;
}

interface FetchTransactionProperties {
	flush: boolean;
	mode?: string;
	transactionType?: any;
	transactionTypes: string[];
	wallets: ProfileContracts.IReadWriteWallet[];
	cursor?: number;
	orderBy?: string;
}

interface FilterTransactionProperties {
	transactions: DTO.ExtendedConfirmedTransactionDataCollection;
}

interface ProfileTransactionsProperties {
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
	limit?: number;
	orderBy?: string;
}

interface TransactionAggregateIdentifiers {
	type: string;
	value: string;
}

interface TransactionAggregateQueryParameters {
	identifiers?: TransactionAggregateIdentifiers[];
	limit: number;
	types?: string[];
	orderBy?: string;
	from?: string;
	to?: string;
}

const filterTransactions = ({ transactions }: FilterTransactionProperties) =>
	transactions.items().filter((transaction) => {
		if (!transaction.isSent()) {
			return true;
		}

		return transaction.isConfirmed();
	});

const syncWallets = async (wallets: Contracts.IReadWriteWallet[]) => {
	const ttl = 5000;
	await Promise.allSettled(
		wallets.map((wallet) => {
			if (wallet.hasSyncedWithNetwork()) {
				return;
			}

			return wallet.synchroniser().identity({ ttl });
		}),
	);
};

const getOrderByStr = ({ column, desc }: SortBy): string => {
	const columnMap = {
		"Fiat Value": "amount",
		amount: "amount",
		date: "timestamp",
	};

	return columnMap[column] + ":" + (desc ? "desc" : "asc");
};

const removeConfirmedPendingTransactions = (
	confirmedTransactions: DTO.ExtendedConfirmedTransactionData[],
	removePendingTransaction: (hash: string) => void,
) => {
	const confirmedHashes = new Set(confirmedTransactions.map((tx) => tx.hash()));

	return (pendingHash: string) => {
		if (confirmedHashes.has(pendingHash)) {
			removePendingTransaction(pendingHash);
		}
	};
};

export const useProfileTransactions = ({ profile, wallets, limit = 30 }: ProfileTransactionsProperties) => {
	const isMounted = useRef(true);
	const cursor = useRef(1);
	const LIMIT = limit;
	const { types } = useTransactionTypes({ wallets });
	const { syncOnChainUsernames } = useWalletAlias();
	const { pendingTransactions, removePendingTransaction } = usePendingTransactions();
	const allTransactionTypes = [...types.core];

	const [sortBy, setSortBy] = useState<SortBy>({ column: "date", desc: true });

	const orderBy = getOrderByStr(sortBy);

	const [
		{
			transactions,
			activeMode,
			activeTransactionType,
			isLoadingTransactions,
			isLoadingMore,
			hasMore,
			timestamp,
			selectedTransactionTypes,
		},
		setState,
		// @ts-ignore
	] = useState<TransactionsState>({
		activeMode: undefined,
		activeTransactionType: undefined,
		hasMore: true,
		isLoadingMore: false,
		isLoadingTransactions: true,
		selectedTransactionTypes: allTransactionTypes,
		timestamp: undefined,
		transactions: [],
	});

	const hasMorePages = (itemsLength: number, hasMorePages: boolean, itemsLimit = LIMIT) => {
		if (itemsLength < itemsLimit) {
			return false;
		}
		return hasMorePages;
	};

	const mergedTransactions = useMemo(() => {
		const walletAddresses = wallets.map((w) => w.address());
		const walletNetworkIds = wallets.map((w) => w.networkId());

		const relevantPendingTxs = pendingTransactions.filter(
			(tx) => walletAddresses.includes(tx.walletAddress) && walletNetworkIds.includes(tx.networkId),
		);

		const hasAllSelected = selectedTransactionTypes.length === allTransactionTypes.length;
		const filteredPendingTxs = hasAllSelected
			? relevantPendingTxs
			: relevantPendingTxs.filter((tx) => selectedTransactionTypes.includes(tx.type));

		const modeFilteredPendingTxs = filteredPendingTxs.filter((tx) => {
			if (activeMode === "sent") {
				return walletAddresses.includes(tx.from);
			}
			if (activeMode === "received") {
				return walletAddresses.includes(tx.to);
			}
			return true;
		});

		const pendingAsConfirmed = modeFilteredPendingTxs.map((tx) => {
			const timestampObj = DateTime.make(tx.timestamp);

			return {
				...tx,
				blockHash: () => {},
				confirmations: () => ({ toNumber: () => 0 }),
				convertedAmount: () => tx.convertedAmount,
				convertedTotal: () => tx.convertedTotal,
				explorerLink: () => tx.explorerLink,
				fee: () => tx.fee,
				from: () => tx.from,
				hash: () => tx.hash,
				isConfirmed: () => false,
				isFailed: () => false,
				isMultiPayment: () => tx.isMultiPayment,
				isPending: () => true,
				isReceived: () => walletAddresses.includes(tx.to),
				isReturn: () => tx.isReturn,
				isSent: () => walletAddresses.includes(tx.from),
				isSuccess: () => false,
				isTransfer: () => tx.isTransfer,
				isUnvote: () => tx.isUnvote,
				isUpdateValidator: () => tx.isUpdateValidator,
				isUsernameRegistration: () => tx.isUsernameRegistration,
				isUsernameResignation: () => tx.isUsernameResignation,
				isValidatorRegistration: () => tx.isValidatorRegistration,
				isValidatorResignation: () => tx.isValidatorResignation,
				isVote: () => tx.isVote,
				isVoteCombination: () => tx.isVoteCombination,
				network: () => wallets.find((w) => w.address() === tx.walletAddress)?.network(),
				nonce: () => tx.nonce,
				recipients: () => tx.recipients || [],
				timestamp: () => timestampObj,
				to: () => tx.to,
				total: () => tx.total,
				type: () => tx.type,
				value: () => tx.value,
				wallet: () => wallets.find((w) => w.address() === tx.walletAddress),
			};
		}) as any[];

		const combined = [...pendingAsConfirmed, ...transactions];

		return combined.sort((a, b) => {
			const aTimestamp = a.timestamp().toUNIX();
			const bTimestamp = b.timestamp().toUNIX();

			if (sortBy.column === "date") {
				return sortBy.desc ? bTimestamp - aTimestamp : aTimestamp - bTimestamp;
			}

			if (sortBy.desc) {
				if (a.isPending && !b.isPending) {
					return -1;
				}
				if (!a.isPending && b.isPending) {
					return 1;
				}
			}

			return 0;
		});
	}, [transactions, pendingTransactions, wallets, selectedTransactionTypes, activeMode, sortBy, allTransactionTypes]);

	const selectedWalletAddresses = wallets.map((wallet) => wallet.address()).join("-");

	useEffect(() => {
		const loadTransactions = async () => {
			try {
				const response = await fetchTransactions({
					flush: true,
					mode: activeMode!,
					transactionType: activeTransactionType,
					transactionTypes: selectedTransactionTypes,
					wallets,
				});

				/* istanbul ignore next -- @preserve */
				if (!isMounted.current) {
					return;
				}

				const addresses = response
					.items()
					.flatMap((transaction) => [
						transaction.from(),
						transaction.to(),
						...transaction.recipients().map(({ address }) => address),
					])
					.filter(Boolean); // This is to filter out null values, for example a contract deployment recipient

				const uniqueAddresses = [...new Set(addresses)] as string[];

				const networks = wallets.map((wallet) => wallet.network());

				await syncOnChainUsernames({ addresses: uniqueAddresses, networks, profile });

				const items = filterTransactions({ transactions: response });

				setState((state) => ({
					...state,
					hasMore: hasMorePages(items.length, response.hasMorePages()),
					isLoadingTransactions: false,
					transactions: items,
				}));
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error({ error });
			}
		};

		delay(() => loadTransactions(), 0);

		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [selectedWalletAddresses, activeMode, activeTransactionType, timestamp, selectedTransactionTypes, orderBy]);

	useEffect(() => {
		if (transactions.length === 0 || pendingTransactions.length === 0) {
			return;
		}

		const checkForConfirmedTransactions = removeConfirmedPendingTransactions(
			transactions,
			removePendingTransaction,
		);

		for (const pendingTx of pendingTransactions) {
			checkForConfirmedTransactions(pendingTx.hash);
		}
	}, [transactions, pendingTransactions, removePendingTransaction]);

	const updateFilters = useCallback(
		({
			activeMode,
			activeTransactionType,
			timestamp,
			selectedTransactionTypes: newTransactionTypes,
		}: TransactionFilters) => {
			const hasWallets = wallets.length > 0;
			cursor.current = 1;

			/* istanbul ignore next -- @preserve */
			if (!isMounted.current) {
				return;
			}

			// @ts-ignore
			setState({
				// Don't set isLoading when there are no wallets
				activeMode,
				activeTransactionType,
				isLoadingMore: false,
				isLoadingTransactions: hasWallets,
				selectedTransactionTypes: newTransactionTypes ?? selectedTransactionTypes,
				timestamp,
				transactions: [],
			});
		},
		[wallets.length],
	);

	const fetchTransactions = useCallback(
		async ({ flush, mode = "all", wallets, transactionTypes }: FetchTransactionProperties) => {
			if (wallets.length === 0) {
				return { hasMorePages: () => false, items: () => [] };
			}

			await syncWallets(wallets);

			if (flush) {
				profile.transactionAggregate().flush(mode);
			}

			const queryParameters: TransactionAggregateQueryParameters = {
				limit: LIMIT,
				orderBy,
			};

			const hasAllSelected = transactionTypes.length === allTransactionTypes.length;

			if (transactionTypes.length > 0 && !hasAllSelected) {
				queryParameters.types = transactionTypes;
			}

			if (mode === "all") {
				queryParameters.identifiers = wallets.map((wallet) => ({
					type: "address",
					value: wallet.address(),
				}));
			}

			if (mode === "sent") {
				queryParameters.from = wallets.map((wallet) => wallet.address()).join(",");
			}

			if (mode === "received") {
				queryParameters.to = wallets.map((wallet) => wallet.address()).join(",");
			}

			// @ts-ignore
			return profile.transactionAggregate()[mode](queryParameters);
		},
		[LIMIT, orderBy, profile],
	);

	const fetchMore = useCallback(async () => {
		cursor.current = cursor.current + 1;
		setState((state) => ({ ...state, isLoadingMore: true }));

		await syncWallets(wallets);
		const response = await fetchTransactions({
			cursor: cursor.current,
			flush: false,
			mode: activeMode,
			transactionTypes: selectedTransactionTypes,
			wallets,
		});

		const items = filterTransactions({ transactions: response });

		setState((state) => ({
			...state,
			hasMore: hasMorePages(items.length, response.hasMorePages()),
			isLoadingMore: false,
			transactions: [...state.transactions, ...items],
		}));
	}, [activeMode, activeTransactionType, wallets.length, selectedTransactionTypes, orderBy]);

	/**
	 * Run periodically every 30 seconds to check for new transactions
	 */
	const checkNewTransactions = async () => {
		await syncWallets(wallets);
		const response = await fetchTransactions({
			cursor: 1,
			flush: true,
			mode: activeMode,
			transactionType: activeTransactionType,
			transactionTypes: selectedTransactionTypes,
			wallets,
		});

		const items = filterTransactions({ transactions: response });

		const latestTransaction = items[0];

		const foundNew =
			latestTransaction &&
			/* istanbul ignore next -- @preserve */
			!transactions.some(
				/* istanbul ignore next -- @preserve */
				(transaction) => latestTransaction.hash() === transaction.hash(),
			);

		if (!foundNew) {
			return;
		}

		setState((state) => ({
			...state,
			hasMore: hasMorePages(items.length, response.hasMorePages(), 1),
			isLoadingMore: false,
			transactions: items,
		}));
	};

	const hasEmptyResults = useMemo(() => {
		if (selectedTransactionTypes?.length === 0) {
			return true;
		}

		return mergedTransactions.length === 0 && !isLoadingTransactions;
	}, [isLoadingTransactions, mergedTransactions.length]);

	const addresses = wallets
		.map((wallet) => wallet.address())
		.toSorted((a, b) => a.localeCompare(b))
		.join("-");

	const transactionTypes = selectedTransactionTypes?.join("-");

	const jobs = useMemo(
		() => [
			{
				callback: checkNewTransactions,
				interval: 15_000,
			},
		],
		[addresses, activeMode, transactionTypes, activeTransactionType, transactions],
	);

	const { start, stop } = useSynchronizer(jobs);

	useEffect(() => {
		start();
		return () => stop();
	}, [start, stop]);

	return {
		activeMode,
		activeTransactionType,
		fetchMore,
		hasEmptyResults,
		hasFilter: selectedTransactionTypes.length < allTransactionTypes.length,
		hasMore,
		isLoadingMore,
		isLoadingTransactions,
		selectedTransactionTypes,
		setSortBy,
		sortBy,
		transactions: selectedTransactionTypes.length > 0 ? mergedTransactions : [],
		updateFilters,
	};
};
