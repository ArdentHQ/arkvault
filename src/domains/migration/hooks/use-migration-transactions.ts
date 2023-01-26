import { useEffect, useMemo, useState, useCallback } from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { useConfiguration, useMigrations } from "@/app/contexts";
import {
	isValidMigrationTransaction,
	migrationMinBalance,
	migrationNetwork,
	migrationTransactionFee,
	migrationWalletAddress,
	polygonMigrationStartTime,
} from "@/utils/polygon-migration";
import { Migration } from "@/domains/migration/migration.contracts";

export const fetchMigrationTransactions = async ({ profile, page }: { page: number; profile: Contracts.IProfile }) => {
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
	} = {
		amount: { from: BigNumber.make(migrationMinBalance()).times(1e8).toString() },
		fee: { from: BigNumber.make(migrationTransactionFee()).times(1e8).toString() },
		page,
		recipientId: migrationWalletAddress(),
		senderId: senderIds.join(","),
	};

	if (polygonMigrationStartTime() > 0) {
		query.timestamp = { from: polygonMigrationStartTime() };
	}

	const transactions = await wallet.transactionIndex().received(query);

	return {
		cursor: Number(transactions.currentPage()),
		hasMore: transactions.items().length > 0,
		items: transactions.items(),
	};
};

export const useMigrationTransactions = ({ profile }: { profile: Contracts.IProfile }) => {
	const { profileIsRestoring } = useConfiguration();
	const { migrations, storeTransactions } = useMigrations();
	const [latestTransactions, setLatestTransactions] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);
	const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);
	const limit = 10;

	const loadMigrationWalletTransactions = useCallback(async () => {
		if (profileIsRestoring) {
			return;
		}

		setIsLoadingTransactions(true);

		const { items, hasMore, cursor } = await fetchMigrationTransactions({ page: page + 1, profile });

		setLatestTransactions(items);
		setIsLoadingTransactions(false);
		setHasMore(hasMore);
		setPage(cursor);
	}, [profileIsRestoring, profile, page, hasMore]);

	useEffect(() => {
		loadMigrationWalletTransactions();
	}, [profileIsRestoring]);

	const migrationTransactions = useMemo(() => {
		const storedMigrationIds = new Set((migrations ?? []).map((migration) => migration.id));

		return latestTransactions.filter((transaction) => {
			if (storedMigrationIds.has(transaction.id())) {
				return false;
			}

			return isValidMigrationTransaction(transaction);
		});
	}, [migrations, latestTransactions, isLoadingTransactions]);

	useEffect(() => {
		const updateTransactions = async () => {
			await storeTransactions(migrationTransactions);
		};

		updateTransactions();
	}, [migrationTransactions]);

	const resolveTransaction = useCallback(
		(migration: Migration) => latestTransactions.find((transaction) => transaction.id() === migration.id),
		[latestTransactions],
	);

	const isLoading = useMemo(() => {
		if (profileIsRestoring) {
			return true;
		}

		if (isLoadingTransactions) {
			return true;
		}

		return migrationTransactions.length > 0 && !migrations;
	}, [profileIsRestoring, isLoadingTransactions, migrationTransactions, migrations]);

	const migrationsPage = useMemo(() => {
		if (!migrations) {
			return [];
		}

		return migrations.slice(0, page * limit);
	}, [migrations, page, limit]);

	return {
		hasMore,
		isLoading: (page === 0 && isLoading) || !migrations,
		isLoadingMore: page > 0 && isLoading,
		migrations: migrationsPage,
		onLoadMore: () => loadMigrationWalletTransactions(),
		page,
		resolveTransaction,
	};
};
