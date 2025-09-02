import { Contracts, DTO, Contracts as ProfileContracts } from "@/app/lib/profiles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSynchronizer, useWalletAlias } from "@/app/hooks";
import { useUnconfirmedTransactions } from "@/domains/transaction/hooks/use-unconfirmed-transactions";

import { SortBy } from "@/app/components/Table";
import { delay } from "@/utils/delay";
import { useTransactionTypes } from "./use-transaction-types";
import { SignedTransactionData } from "@/app/lib/mainsail/signed-transaction.dto";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { IReadWriteWallet } from "@/app/lib/profiles/wallet.contract";
import { ExtendedTransactionDTO } from "@/domains/transaction/components/TransactionTable";
import { UnconfirmedTransactionsService } from "@/app/lib/mainsail/unconfirmed-transactions.service";
import { get } from "@/app/lib/helpers";

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

export const useProfileTransactions = ({ profile, wallets, limit = 30 }: ProfileTransactionsProperties) => {
	const isMounted = useRef(true);
	const cursor = useRef(1);
	const LIMIT = limit;
	const { types } = useTransactionTypes({ wallets });
	const { syncOnChainUsernames } = useWalletAlias();

	const { unconfirmedTransactions, removeUnconfirmedTransaction, addUnconfirmedTransactionFromUnconfirmed } =
		useUnconfirmedTransactions();

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

	const allTransactions = useMemo(() => {
		const walletAddresses = wallets.map((w) => w.address());
		const walletNetworkIds = wallets.map((w) => w.networkId());

		const hasAllSelected = selectedTransactionTypes.length === allTransactionTypes.length;

		const signedTransactions = unconfirmedTransactions
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
		unconfirmedTransactions,
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
		if (transactions.length === 0 || unconfirmedTransactions.length === 0) {
			return;
		}

		const checkForConfirmedTransactions = removeConfirmedUnconfirmedTransactions(
			transactions,
			removeUnconfirmedTransaction,
		);

		for (const unconfirmedTx of unconfirmedTransactions) {
			checkForConfirmedTransactions(unconfirmedTx.transaction.signedData.hash);
		}
	}, [transactions, unconfirmedTransactions, removeUnconfirmedTransaction]);

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

	const unconfirmedTransactionsService = useRef<UnconfirmedTransactionsService | null>(null);

	useEffect(() => {
		if (!wallets?.length) {
			unconfirmedTransactionsService.current = null;
			return;
		}

		try {
			unconfirmedTransactionsService.current = new UnconfirmedTransactionsService({
				config: profile.activeNetwork().config(),
				profile,
			});
		} catch (error) {
			/* istanbul ignore next -- @preserve */
			{
				console.error("Failed to initialize UnconfirmedTransactionsService:", error);
				unconfirmedTransactionsService.current = null;
			}
		}
	}, [wallets]);

	const getBlockTime = () => {
		try {
			const first = wallets[0];
			if (!first) {
				return 15_000;
			}
			const milestone = first.network().milestone?.();
			const blockTime = get(milestone, "timeouts.blockTime") as unknown;
			if (typeof blockTime === "number" && Number.isFinite(blockTime)) {
				return blockTime;
			}
		} catch {
			/* istanbul ignore next -- @preserve */
			console.error("Failed to get block time");
		}
		return 15_000;
	};

	const walletsKey = useMemo(() => wallets.map((w) => w.address()).join("|"), [wallets]);
	const blockTime = useMemo(() => getBlockTime(), [walletsKey]);

	const fetchUnconfirmedTransactions = useCallback(async () => {
		const service = unconfirmedTransactionsService.current;
		/* istanbul ignore next -- @preserve */
		if (!service) {
			return;
		}

		try {
			const selectedAddresses = wallets.map((w) => w.address());
			const response = await service.listUnconfirmed({ from: selectedAddresses, to: selectedAddresses });

			for (const transaction of response?.results ?? []) {
				const matched =
					wallets.find((wallet) => wallet.address().toLowerCase() === transaction.from?.toLowerCase?.()) ||
					wallets.find((wallet) => wallet.address().toLowerCase() === transaction.to?.toLowerCase?.());

				/* istanbul ignore next -- @preserve */
				if (!matched) {
					continue;
				}

				const gasLimit = (transaction as any).gasLimit ?? (transaction as any).gas;

				addUnconfirmedTransactionFromUnconfirmed({
					...transaction,
					gasLimit,
					networkId: matched.networkId(),
					walletAddress: matched.address(),
				});
			}
		} catch (error) {
			/* istanbul ignore next -- @preserve */
			console.error("Failed to fetch unconfirmed transactions:", error);
		}
	}, [wallets, addUnconfirmedTransactionFromUnconfirmed]);

	const pollingCallbackRef = useRef(fetchUnconfirmedTransactions);
	useEffect(() => {
		pollingCallbackRef.current = fetchUnconfirmedTransactions;
	}, [fetchUnconfirmedTransactions]);

	useEffect(() => {
		const service = unconfirmedTransactionsService.current;
		if (!service) {
			return;
		}

		const id = setInterval(() => {
			pollingCallbackRef.current();
		}, blockTime);

		return () => clearInterval(id);
	}, [unconfirmedTransactionsService.current, blockTime]);

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