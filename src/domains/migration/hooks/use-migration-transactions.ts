import { useCallback, useEffect, useMemo, useState } from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { BigNumber } from "@ardenthq/sdk-helpers";
import {
	migrationMinBalance,
	migrationNetwork,
	migrationTransactionFee,
	migrationWalletAddress,
	polygonMigrationStartTime,
} from "@/utils/polygon-migration";
import { useConfiguration } from "@/app/contexts";
const PAGINATION_LIMIT = 11;

export const fetchMigrationTransactions = async ({
	profile,
	profileWallets,
	page,
	limit,
}: {
	page: number;
	profile: Contracts.IProfile;
	profileWallets: Contracts.IReadWriteWallet[];
	limit?: number;
}) => {
	const wallet = await profile.walletFactory().fromAddress({
		address: migrationWalletAddress(),
		coin: "ARK",
		network: migrationNetwork(),
	});

	const senderIds = profileWallets.map((wallet) => wallet.address());

	if (senderIds.length === 0) {
		return {
			cursor: page,
			hasMore: false,
			items: [],
		};
	}

	const query: {
		recipientId: string;
		senderId: string;
		amount: { from: string };
		fee: { from: string };
		timestamp?: { from?: number; to?: number };
		page?: number;
		limit?: number;
	} = {
		amount: { from: BigNumber.make(migrationMinBalance()).times(1e8).toString() },
		fee: { from: BigNumber.make(migrationTransactionFee()).times(1e8).toString() },
		limit,
		page,
		recipientId: migrationWalletAddress(),
		senderId: senderIds.join(","),
	};

	const startTime = polygonMigrationStartTime();

	if (startTime > 0) {
		query.timestamp = { from: startTime };
	}

	const transactions = await wallet.transactionIndex().received(query);

	return {
		cursor: Number(transactions.currentPage()),
		hasMore: transactions.items().length > 0,
		items: transactions.items(),
	};
};

export const useMigrationTransactions = ({ profile }: { profile: Contracts.IProfile | undefined }) => {
	const { profileIsSyncing } = useConfiguration();
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);
	const [transactionsLoaded, setTransactionsLoaded] = useState<boolean>(false);
	const [toLoadTransactions, setToLoadTransactions] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(true);
	const [latestTransactions, setLatestTransactions] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);

	const walletsCount = profile?.wallets().count();

	const profileWallets = useMemo(() => {
		if (profileIsSyncing || !profile) {
			return;
		}

		return profile
			.wallets()
			.values()
			.filter((wallet) => wallet.networkId() === migrationNetwork());
	}, [walletsCount, profileIsSyncing, profile]);

	const loadMigrationWalletTransactions = useCallback(async () => {
		setIsLoading(true);

		const { items, hasMore, cursor } = await fetchMigrationTransactions({
			limit: PAGINATION_LIMIT,
			page: page + 1,
			profile: profile!,
			profileWallets: profileWallets!,
		});

		setLatestTransactions((existingItems) => [...existingItems, ...items]);
		setHasMore(hasMore);
		setPage(cursor);
		setTransactionsLoaded(true);
		setIsLoading(false);
	}, [profile, page, hasMore, transactionsLoaded, profileWallets]);

	const removeTransactions = async (walletAddress: string) => {
		setLatestTransactions((transactions) =>
			transactions.filter((transaction) => transaction.wallet().address() !== walletAddress),
		);

		await loadMigrationWalletTransactions();

		setToLoadTransactions(true);
	};

	useEffect(() => {
		if (toLoadTransactions) {
			loadMigrationWalletTransactions();

			setToLoadTransactions(false);
		}
	}, [toLoadTransactions, loadMigrationWalletTransactions]);

	useEffect(() => {
		setTransactionsLoaded(false);
		setPage(0);
		setIsLoading(true);
		setHasMore(false);
		setLatestTransactions([]);

		if (profileIsSyncing) {
			return;
		}

		if (walletsCount === 0) {
			setTransactionsLoaded(true);
			setIsLoading(false);
			setPage(1);
		} else {
			setToLoadTransactions(true);
		}
	}, [walletsCount, profileIsSyncing]);

	return {
		hasMore,
		isLoading,
		latestTransactions,
		limit: PAGINATION_LIMIT,
		loadMigrationWalletTransactions,
		page,
		removeTransactions,
		transactionsLoaded,
	};
};
