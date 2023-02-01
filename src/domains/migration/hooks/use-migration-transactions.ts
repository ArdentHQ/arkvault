import { useCallback, useEffect, useState } from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { BigNumber } from "@ardenthq/sdk-helpers";
import {
	migrationMinBalance,
	migrationNetwork,
	migrationTransactionFee,
	migrationWalletAddress,
	polygonMigrationStartTime,
} from "@/utils/polygon-migration";

const PAGINATION_LIMIT = 11;

export const fetchMigrationTransactions = async ({
	profile,
	page,
	limit,
}: {
	page: number;
	profile: Contracts.IProfile;
	limit?: number;
}) => {
	const wallet = await profile.walletFactory().fromAddress({
		address: migrationWalletAddress(),
		coin: "ARK",
		network: migrationNetwork(),
	});

	const senderIds = profile
		.wallets()
		.values()
		.filter((wallet) => wallet.networkId() === migrationNetwork())
		.map((wallet) => wallet.address());

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
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);
	const [transactionsLoaded, setTransactionsLoaded] = useState<boolean>(false);
	const [isLoadingMoreTransactions, setIsLoadingMoreTransactions] = useState(true);
	const [latestTransactions, setLatestTransactions] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);

	const loadMigrationWalletTransactions = useCallback(async () => {
		if (transactionsLoaded) {
			setIsLoadingMoreTransactions(true);
		}

		const { items, hasMore, cursor } = await fetchMigrationTransactions({
			limit: PAGINATION_LIMIT,
			page: page + 1,
			profile: profile!,
		});

		setLatestTransactions((existingItems) => [...existingItems, ...items]);
		setHasMore(hasMore);
		setPage(cursor);
		setTransactionsLoaded(true);
		setIsLoadingMoreTransactions(false);
	}, [profile, page, hasMore, transactionsLoaded]);

	useEffect(() => {
		if (!profile) {
			setTransactionsLoaded(false);
			setPage(0);
			setIsLoadingMoreTransactions(false);
			setHasMore(false);
			setLatestTransactions([]);
			return;
		}

		if (!transactionsLoaded) {
			loadMigrationWalletTransactions();
		}
	}, [profile, loadMigrationWalletTransactions, transactionsLoaded]);

	return {
		hasMore,
		isLoadingMoreTransactions,
		latestTransactions,
		limit: PAGINATION_LIMIT,
		loadMigrationWalletTransactions,
		page,
		transactionsLoaded,
	};
};
