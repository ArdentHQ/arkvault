import { sortByDesc } from "@ardenthq/sdk-helpers";
import { Contracts, Contracts as ProfileContracts, DTO } from "@ardenthq/sdk-profiles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSynchronizer } from "@/app/hooks";
import { isUnit } from "@/utils/test-helpers";
import { delay } from "@/utils/delay";
import { useTransactionTypes } from "./use-transaction-types";

interface TransactionsState {
	transactions: DTO.ExtendedConfirmedTransactionData[];
	isLoadingTransactions: boolean;
	isLoadingMore: boolean;
	activeMode?: string;
	activeTransactionType?: any;
	selectedTransactionTypes?: string[];
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
	flush?: boolean;
	mode?: string;
	transactionType?: any;
	transactionTypes?: string[];
	wallets: ProfileContracts.IReadWriteWallet[];
	cursor?: number;
}

interface FilterTransactionProperties {
	transactions: DTO.ExtendedConfirmedTransactionDataCollection;
}

interface ProfileTransactionsProperties {
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
	limit?: number;
}

interface TransactionAggregateIdentifiers {
	type: string;
	value: string;
}

interface TransactionAggregateQueryParameters {
	identifiers: TransactionAggregateIdentifiers[];
	limit: number;
	types?: string[];
}

const filterTransactions = ({ transactions }: FilterTransactionProperties) =>
	transactions.items().filter((transaction) => {
		if (!transaction.isSent()) {
			return true;
		}

		return transaction.isConfirmed();
	});

export const useProfileTransactions = ({ profile, wallets, limit = 30 }: ProfileTransactionsProperties) => {
	const lastQuery = useRef<string>();
	const isMounted = useRef(true);
	const cursor = useRef(1);
	const LIMIT = useMemo(() => (isUnit() ? 0 : limit), [limit]);
	const { types } = useTransactionTypes({ wallets });
	const allTransactionTypes = [...types.core, ...types.magistrate];

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

	useEffect(() => {
		const loadTransactions = async () => {
			const response = await fetchTransactions({
				flush: true,
				mode: activeMode!,
				transactionType: activeTransactionType,
				transactionTypes: selectedTransactionTypes,
				wallets,
			});

			const isAborted = () => {
				const activeQuery = JSON.stringify({ activeMode, activeTransactionType });
				return activeQuery !== lastQuery.current;
			};

			if (isAborted()) {
				return;
			}

			/* istanbul ignore next -- @preserve */
			if (!isMounted.current) {
				return;
			}

			const items = filterTransactions({ transactions: response });

			setState((state) => ({
				...state,
				hasMore: hasMorePages(items.length, response.hasMorePages()),
				isLoadingTransactions: false,
				transactions: items,
			}));
		};

		if (!lastQuery.current) {
			return;
		}

		delay(() => loadTransactions(), 0);

		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [wallets.length, activeMode, activeTransactionType, timestamp, selectedTransactionTypes]); // eslint-disable-line react-hooks/exhaustive-deps

	const updateFilters = useCallback(
		({ activeMode, activeTransactionType, timestamp, selectedTransactionTypes }: TransactionFilters) => {
			lastQuery.current = JSON.stringify({ activeMode, activeTransactionType });

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
				selectedTransactionTypes,
				timestamp,
				transactions: [],
			});
		},
		[wallets.length],
	);

	const fetchTransactions = useCallback(
		({ flush = false, mode = "all", wallets = [], transactionTypes = [] }: FetchTransactionProperties) => {
			if (wallets.length === 0 || transactionTypes.length === 0) {
				return { hasMorePages: () => false, items: () => [] };
			}

			if (flush) {
				profile.transactionAggregate().flush(mode);
			}

			const queryParameters: TransactionAggregateQueryParameters = {
				identifiers: wallets.map((wallet) => ({
					type: "address",
					value: wallet.address(),
				})),
				limit: LIMIT,
			};

			const hasAllSelected = transactionTypes.length === allTransactionTypes.length;

			if (!hasAllSelected) {
				queryParameters.types = transactionTypes;
			}

			// @ts-ignore
			return profile.transactionAggregate()[mode](queryParameters);
		},
		[LIMIT, profile],
	);

	const fetchMore = useCallback(async () => {
		cursor.current = cursor.current + 1;
		setState((state) => ({ ...state, isLoadingMore: true }));

		const response = await fetchTransactions({
			cursor: cursor.current,
			flush: false,
			mode: activeMode,
			transactionType: activeTransactionType,
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
	}, [activeMode, activeTransactionType, wallets.length]); // eslint-disable-line react-hooks/exhaustive-deps

	/**
	 * Run periodically every 30 seconds to check for new transactions
	 */
	const checkNewTransactions = async () => {
		const response = await fetchTransactions({
			cursor: 1,
			flush: true,
			mode: activeMode,
			transactionType: activeTransactionType,
			transactionTypes: selectedTransactionTypes,
			wallets,
		});

		const items = filterTransactions({ transactions: response });

		const latestTransaction = sortByDesc(items, (transaction) => transaction.timestamp()?.toUNIX())[0];

		const foundNew =
			latestTransaction && !transactions.some((transaction) => latestTransaction.id() === transaction.id());

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

		return transactions.length === 0 && !isLoadingTransactions;
	}, [isLoadingTransactions, transactions.length]);

	const { start, stop } = useSynchronizer([
		{
			callback: checkNewTransactions,
			interval: 30_000,
		},
	]);

	useEffect(() => {
		start();
		return () => stop();
	}, [start, stop]);

	return {
		activeMode,
		activeTransactionType,
		fetchMore,
		fetchTransactions,
		hasEmptyResults,
		hasMore,
		isLoadingMore,
		isLoadingTransactions,
		selectedTransactionTypes,
		transactions,
		updateFilters,
	};
};
