/* eslint-disable sonarjs/cognitive-complexity */
import { Contracts, DTO, Contracts as ProfileContracts } from "@/app/lib/profiles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSynchronizer, useWalletAlias } from "@/app/hooks";

import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { ExtendedTransactionDTO } from "@/domains/transaction/components/TransactionTable";
import { SignedTransactionData } from "@/app/lib/mainsail/signed-transaction.dto";
import { SortBy } from "@/app/components/Table";
import { delay } from "@/utils/delay";
import { useTransactionPagination } from "./use-transaction-pagination";
import { useTransactionTypes } from "./use-transaction-types";
import { useUnconfirmedTransactionSync } from "./use-unconfirmed-transaction-sync";
import { useUnconfirmedTransactions } from "@/domains/transaction/hooks/use-unconfirmed-transactions";

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
	cursor?: number;
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

const getOrderByStr = ({ column, desc }: SortBy): string => {
	const columnMap = {
		"Fiat Value": "amount",
		amount: "amount",
		date: "timestamp",
	};

	return columnMap[column] + ":" + (desc ? "desc" : "asc");
};

const removeConfirmedUnconfirmedTransactions = (
	confirmedTransactions: DTO.ExtendedConfirmedTransactionData[],
	removeUnconfirmedTransaction: (hash: string) => void,
) => {
	const confirmedHashes = new Set(confirmedTransactions.map((tx) => tx.hash()));

	return (unconfirmedHash: string) => {
		if (confirmedHashes.has(unconfirmedHash)) {
			removeUnconfirmedTransaction(unconfirmedHash);
		}
	};
};

export const useProfileTransactions = ({ profile, wallets, limit = 30 }: ProfileTransactionsProperties) => {
	const isMounted = useRef(true);
	const LIMIT = limit;

	const { types } = useTransactionTypes({ wallets });
	const { syncOnChainUsernames } = useWalletAlias();

	const {
		unconfirmedTransactions: allUnconfirmedTransactions,
		removeUnconfirmedTransaction,
		addUnconfirmedTransactionFromApi,
		cleanupUnconfirmedForAddresses,
	} = useUnconfirmedTransactions();

	const allTransactionTypes = useMemo(() => [...types.core], [types.core]);

	const pagination = useTransactionPagination({ limit: LIMIT });

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

	const unconfirmedTransactions = useMemo(
		() =>
			wallets
				.map((wallet) =>
					(allUnconfirmedTransactions[wallet.networkId()]?.[wallet.address()] ?? []).map(
						(tx) =>
							new ExtendedSignedTransactionData(
								new SignedTransactionData().configure(tx.signedData, tx.serialized),
								wallet,
							),
					),
				)
				.flat(),
		[allUnconfirmedTransactions, wallets],
	);

	const allTransactions = useMemo(() => {
		const hasAllSelected = selectedTransactionTypes.length === allTransactionTypes.length;

		// Defensive: never render the same transaction twice, however the
		// accumulated pages ended up in state.
		const confirmedTransactions = pagination.dedupe(transactions);
		const confirmedTransactionIds = new Set(confirmedTransactions.map((transaction) => transaction.hash()));

		const signedTransactions = unconfirmedTransactions
			.filter((transaction) => (hasAllSelected ? true : selectedTransactionTypes.includes(transaction.type())))
			.filter((transaction) => {
				if (activeMode === "sent") {
					return transaction.wallet().address() === transaction.from();
				}

				if (activeMode === "received") {
					return transaction.wallet().address() === transaction.to();
				}

				return true;
			})
			.filter((transaction) => !confirmedTransactionIds.has(transaction.hash()));

		const combined: ExtendedTransactionDTO[] = [...signedTransactions, ...confirmedTransactions];

		const sorted = combined.sort((a, b) => {
			const aTimestamp = a.timestamp()!.toUNIX();
			const bTimestamp = b.timestamp()!.toUNIX();

			if (sortBy.column === "date") {
				return sortBy.desc ? bTimestamp - aTimestamp : aTimestamp - bTimestamp;
			}
			if (sortBy.desc) {
				const aIsSignedTransaction = a instanceof ExtendedSignedTransactionData;
				const bIsSignedTransaction = b instanceof ExtendedSignedTransactionData;
				/* istanbul ignore next -- @preserve */
				if (aIsSignedTransaction && !bIsSignedTransaction) {
					return -1;
				}
				if (!aIsSignedTransaction && bIsSignedTransaction) {
					return 1;
				}
			}

			return 0;
		});

		const baseLength = Math.max(confirmedTransactions.length, LIMIT);
		const totalPages = Math.ceil(baseLength / LIMIT);
		const maxDisplayItems = LIMIT * totalPages;

		return sorted.slice(0, maxDisplayItems);
	}, [
		transactions,
		unconfirmedTransactions,
		selectedTransactionTypes,
		activeMode,
		sortBy,
		allTransactionTypes,
		pagination,
	]);

	const selectedWalletAddresses = wallets.map((wallet) => wallet.address()).join("-");

	useEffect(() => {
		const loadTransactions = async () => {
			try {
				const response = await fetchTransactions({
					cursor: 1,
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

				// This replaces the whole list with the first page, so the visible list
				// restarts here.
				pagination.startAt(items);

				setState((state) => ({
					...state,
					hasMore: pagination.hasMorePages(items.length, response.hasMorePages()),
					isLoadingTransactions: false,
					transactions: items,
				}));
			} catch (error) {
				console.error({ error });
			}
		};

		delay(() => loadTransactions(), 0);

		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [selectedWalletAddresses, activeMode, activeTransactionType, timestamp, selectedTransactionTypes, orderBy]);

	const latest = useRef({ transactions, unconfirmedTransactions, wallets });

	useEffect(() => {
		latest.current = { transactions, unconfirmedTransactions, wallets };
	});

	const cleanUnconfirmedTransactions = useCallback(async () => {
		const { transactions: currentTransactions, unconfirmedTransactions: currentUnconfirmed } = latest.current;

		if (currentTransactions.length === 0 || currentUnconfirmed.length === 0) {
			return;
		}

		const checkForConfirmedTransactions = removeConfirmedUnconfirmedTransactions(
			currentTransactions,
			removeUnconfirmedTransaction,
		);

		for (const unconfirmedTx of currentUnconfirmed) {
			checkForConfirmedTransactions(unconfirmedTx.hash());
		}
	}, [removeUnconfirmedTransaction]);

	const updateFilters = useCallback(
		({
			activeMode,
			activeTransactionType,
			timestamp,
			selectedTransactionTypes: newTransactionTypes,
		}: TransactionFilters) => {
			const hasWallets = wallets.length > 0;
			pagination.reset();

			/* istanbul ignore next -- @preserve */
			if (!isMounted.current) {
				return;
			}

			// @ts-ignore
			setState({
				// Don't set isLoading when there are no wallets
				activeMode,
				activeTransactionType,
				hasMore: true,
				isLoadingMore: false,
				isLoadingTransactions: hasWallets,
				selectedTransactionTypes: newTransactionTypes ?? selectedTransactionTypes,
				timestamp,
				transactions: [],
			});
		},
		[wallets.length, selectedTransactionTypes, pagination],
	);

	const fetchTransactions = useCallback(
		async ({ flush, cursor, mode = "all", wallets, transactionTypes }: FetchTransactionProperties) => {
			if (wallets.length === 0) {
				return { hasMorePages: () => false, items: () => [] };
			}

			if (flush) {
				profile.transactionAggregate().flush(mode);
			}

			const queryParameters: TransactionAggregateQueryParameters = {
				limit: LIMIT,
				orderBy,
			};

			if (cursor !== undefined) {
				queryParameters.cursor = cursor;
			}

			const hasAllSelected = transactionTypes.length === allTransactionTypes.length;

			if (transactionTypes.length > 0 && !hasAllSelected) {
				queryParameters.types = transactionTypes;
			}

			const isUnconfirmedMode = mode === "unconfirmed";

			if (mode === "all" || isUnconfirmedMode) {
				queryParameters.identifiers = wallets.map((wallet) => ({
					type: "address",
					value: wallet.address(),
				}));
			}

			if (isUnconfirmedMode) {
				delete queryParameters.orderBy;
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
		[LIMIT, orderBy, profile, allTransactionTypes],
	);

	const fetchMore = useCallback(async () => {
		const nextPage = pagination.nextCursor();

		setState((state) => ({ ...state, isLoadingMore: true }));

		try {
			const response = await fetchTransactions({
				cursor: nextPage,
				flush: false,
				mode: activeMode,
				transactionTypes: selectedTransactionTypes,
				wallets,
			});

			const newItems = pagination.acceptPage(nextPage, filterTransactions({ transactions: response }));

			setState((state) => ({
				...state,
				hasMore: response.hasMorePages(),
				isLoadingMore: false,
				transactions: [...state.transactions, ...newItems],
			}));
		} catch (error) {
			console.error({ error });
			setState((state) => ({ ...state, isLoadingMore: false }));
		}
	}, [activeMode, pagination, wallets, selectedTransactionTypes, fetchTransactions]);

	const checkNewTransactions = useCallback(async () => {
		const { wallets: currentWallets, transactions: currentTransactions } = latest.current;

		/* istanbul ignore next -- @preserve */
		if (currentWallets.length === 0) {
			return;
		}

		const response = await fetchTransactions({
			cursor: 1,
			// Deliberately not flushing: a flush rewinds the pagination history that
			// "load more" depends on, which makes it re-request pages that are already
			// on screen. The aggregate always hits the network, so the data is fresh.
			flush: false,
			mode: activeMode,
			transactionType: activeTransactionType,
			transactionTypes: selectedTransactionTypes,
			wallets: currentWallets,
		});

		const items = filterTransactions({ transactions: response });

		const latestTransaction = items[0];

		const foundNew =
			latestTransaction &&
			/* istanbul ignore next -- @preserve */
			!currentTransactions.some(
				/* istanbul ignore next -- @preserve */
				(transaction) => latestTransaction.hash() === transaction.hash(),
			);

		if (!foundNew) {
			return;
		}

		// The visible window restarts at the first page.
		pagination.startAt(items);

		setState((state) => ({
			...state,
			hasMore: pagination.hasMorePages(items.length, response.hasMorePages(), 1),
			isLoadingMore: false,
			transactions: items,
		}));
	}, [activeMode, activeTransactionType, selectedTransactionTypes, fetchTransactions, pagination]);

	const { fetchUnconfirmedTransactions, pollIntervalMs } = useUnconfirmedTransactionSync({
		addUnconfirmedTransactionFromApi,
		cleanupUnconfirmedForAddresses,
		fetchTransactions,
		onNewUnconfirmed: () => setState((state) => ({ ...state, timestamp: Date.now() })),
		profile,
		transactionTypes: allTransactionTypes,
		wallets,
	});

	const jobs = useMemo(
		() => [
			{
				callback: checkNewTransactions,
				interval: 15_000,
			},
			{
				callback: fetchUnconfirmedTransactions,
				interval: pollIntervalMs,
			},
			{
				callback: cleanUnconfirmedTransactions,
				interval: pollIntervalMs,
			},
		],
		[checkNewTransactions, fetchUnconfirmedTransactions, cleanUnconfirmedTransactions, pollIntervalMs],
	);

	const { start, stop } = useSynchronizer(jobs);

	useEffect(() => {
		start();
		return () => stop();
	}, [start, stop]);

	const hasEmptyResults = useMemo(() => {
		if (selectedTransactionTypes?.length === 0) {
			return true;
		}
		return allTransactions.length === 0 && !isLoadingTransactions;
	}, [isLoadingTransactions, allTransactions.length]);

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
		transactions: selectedTransactionTypes.length > 0 ? allTransactions : [],
		updateFilters,
	};
};
