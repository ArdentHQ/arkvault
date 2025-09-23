import { Contracts, DTO, Contracts as ProfileContracts } from "@/app/lib/profiles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSynchronizer, useWalletAlias } from "@/app/hooks";

import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { ExtendedTransactionDTO } from "@/domains/transaction/components/TransactionTable";
import { IReadWriteWallet } from "@/app/lib/profiles/wallet.contract";
import { Network } from "@/app/lib/mainsail/network";
import { RawTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.contract";
import { SignedTransactionData } from "@/app/lib/mainsail/signed-transaction.dto";
import { SortBy } from "@/app/components/Table";
import { UnconfirmedTransactionsService } from "@/app/lib/mainsail/unconfirmed-transactions.service";
import { delay } from "@/utils/delay";
import { get } from "@/app/lib/helpers";
import { useTransactionTypes } from "./use-transaction-types";
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

const getBlockTime = (network: Network): number => {
	const DEFAULT_BLOCK_TIME = 8_000; // Close to expected ARK block time

	try {
		const milestone = network.milestone();
		const blockTime = get(milestone, "timeouts.blockTime") as unknown;
		/* istanbul ignore next -- @preserve */
		if (typeof blockTime === "number" && Number.isFinite(blockTime) && blockTime > 0) {
			return Math.max(1000, blockTime); // Minimum of 1 second
		}
	} catch (error) {
		/* istanbul ignore next -- @preserve */
		console.error("Failed to get block time:", error);
	}
	return DEFAULT_BLOCK_TIME;
};

export const useProfileTransactions = ({ profile, wallets, limit = 30 }: ProfileTransactionsProperties) => {
	const isMounted = useRef(true);
	const cursor = useRef(1);
	const LIMIT = limit;

	const { types } = useTransactionTypes({ wallets });
	const { syncOnChainUsernames } = useWalletAlias();

	const {
		unconfirmedTransactions,
		removeUnconfirmedTransaction,
		addUnconfirmedTransactionFromApi,
		cleanupUnconfirmedForAddresses,
	} = useUnconfirmedTransactions();

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

	const blockTime = useMemo(() => getBlockTime(profile.activeNetwork()), [profile.activeNetwork()]);

	const unconfirmedTransactionsService = useMemo(() => {
		if (!wallets?.length || !profile) {
			return null;
		}

		try {
			return new UnconfirmedTransactionsService({
				config: profile.activeNetwork().config(),
				profile,
				ttl: blockTime / 1000 // in seconds
			});
		} catch (error) {
			/* istanbul ignore next -- @preserve */
			{
				console.error("Failed to initialize UnconfirmedTransactionsService:", error);
				return null;
			}
		}
	}, [profile, wallets?.length > 0]);


	const hasMorePages = (itemsLength: number, hasMorePages: boolean, itemsLimit = LIMIT) => {
		if (itemsLength < itemsLimit) {
			return false;
		}
		return hasMorePages;
	};

	/*
	 * Helper to convert nested unconfirmed transactions
	 * to flat array for processing
	 */
	const getFlatUnconfirmedTransactions = useCallback(() => {
		const flatTransactions: Array<{
			transaction: RawTransactionData;
			walletAddress: string;
			networkId: string;
		}> = [];

		for (const [networkId, wallets] of Object.entries(unconfirmedTransactions)) {
			for (const [walletAddress, transactions] of Object.entries(wallets)) {
				for (const transaction of transactions) {
					flatTransactions.push({
						networkId,
						transaction,
						walletAddress,
					});
				}
			}
		}

		return flatTransactions;
	}, [unconfirmedTransactions]);

	const allTransactions = useMemo(() => {
		const walletAddresses = wallets.map((w) => w.address());
		const walletNetworkIds = wallets.map((w) => w.networkId());

		const hasAllSelected = selectedTransactionTypes.length === allTransactionTypes.length;

		const flatUnconfirmed = getFlatUnconfirmedTransactions();

		const signedTransactions = flatUnconfirmed
			.filter(
				(unconfirmedTransaction) =>
					walletAddresses.includes(unconfirmedTransaction.walletAddress) &&
					walletNetworkIds.includes(unconfirmedTransaction.networkId),
			)
			.map((tx): [SignedTransactionData, string] => [
				new SignedTransactionData().configure(tx.transaction.signedData, tx.transaction.serialized),
				tx.walletAddress,
			])
			.map(([transactionData, walletAddress]) => {
				const wallet = wallets.find((wallet) => wallet.address() === walletAddress) as IReadWriteWallet;
				return new ExtendedSignedTransactionData(transactionData, wallet);
			})
			.filter((transaction) => (hasAllSelected ? true : selectedTransactionTypes.includes(transaction.type())))
			.filter((transaction) => {
				if (activeMode === "sent") {
					return walletAddresses.includes(transaction.from());
				}

				if (activeMode === "received") {
					return walletAddresses.includes(transaction.to());
				}

				return true;
			});

		const combined: ExtendedTransactionDTO[] = [...signedTransactions, ...transactions];

		return combined.sort((a, b) => {
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
	}, [
		transactions,
		getFlatUnconfirmedTransactions,
		wallets,
		selectedTransactionTypes,
		activeMode,
		sortBy,
		allTransactionTypes,
	]);

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
		const flatUnconfirmed = getFlatUnconfirmedTransactions();

		if (transactions.length === 0 || flatUnconfirmed.length === 0) {
			return;
		}

		const checkForConfirmedTransactions = removeConfirmedUnconfirmedTransactions(
			transactions,
			removeUnconfirmedTransaction,
		);

		for (const unconfirmedTx of flatUnconfirmed) {
			checkForConfirmedTransactions(unconfirmedTx.transaction.signedData.hash);
		}
	}, [transactions, getFlatUnconfirmedTransactions, removeUnconfirmedTransaction]);

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
		[wallets.length, selectedTransactionTypes],
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
		[LIMIT, orderBy, profile, allTransactionTypes],
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
	}, [activeMode, wallets, selectedTransactionTypes, fetchTransactions]);

	const checkNewTransactions = useCallback(async () => {
		if (wallets.length === 0) {
			/* istanbul ignore next -- @preserve */
			return;
		}

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
	}, [wallets, activeMode, activeTransactionType, selectedTransactionTypes, fetchTransactions, transactions]);

	const isFetchingUnconfirmed = useRef(false)
	const fetchUnconfirmedTransactions = useCallback(async () => {
		/* istanbul ignore next -- @preserve */
		if (!unconfirmedTransactionsService || wallets.length === 0) {
			return;
		}

		if (isFetchingUnconfirmed.current) {
			return
		}

		try {
			isFetchingUnconfirmed.current = true
			const selectedAddresses = wallets.map((w) => w.address());
			const response = await unconfirmedTransactionsService.listUnconfirmed({
				address: selectedAddresses,
				limit: 100,
			});

			const results = response?.results ?? [];
			const remoteHashes = results.map((t: any) => t.hash).filter(Boolean);
			cleanupUnconfirmedForAddresses(selectedAddresses, remoteHashes);

			const flatUnconfirmedTransactions = getFlatUnconfirmedTransactions();
			/* istanbul ignore next -- @preserve */
			if (remoteHashes.length !== flatUnconfirmedTransactions.length) {
				setState((s) => ({ ...s, timestamp: Date.now() }));
			}

			for (const transaction of results) {
				const matched = wallets.find((wallet) => {
					const walletAddr = wallet.address().toLowerCase();
					const txFrom = transaction.from().toLowerCase();
					const txTo = transaction.to().toLowerCase();
					return walletAddr === txFrom || walletAddr === txTo;
				});

				if (!matched) {
					console.warn("No matching wallet found for transaction:", transaction);
					continue;
				}

				addUnconfirmedTransactionFromApi(matched.networkId(), matched.address(), transaction.raw());
			}
		} catch (error) {
			console.error("Failed to fetch unconfirmed transactions:", error);
		}

		isFetchingUnconfirmed.current = false
	}, [
		unconfirmedTransactionsService,
		wallets,
		addUnconfirmedTransactionFromApi,
		cleanupUnconfirmedForAddresses,
		getFlatUnconfirmedTransactions,
	]);

	useEffect(() => {
		if (!unconfirmedTransactionsService || wallets.length === 0) {
			return;
		}

		fetchUnconfirmedTransactions();

		const intervalId = setInterval(fetchUnconfirmedTransactions, blockTime);

		return () => clearInterval(intervalId);
	}, [unconfirmedTransactionsService, wallets.length, blockTime, fetchUnconfirmedTransactions]);

	const jobs = useMemo(
		() => [
			{
				callback: checkNewTransactions,
				interval: 15_000,
			},
		],
		[checkNewTransactions],
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
