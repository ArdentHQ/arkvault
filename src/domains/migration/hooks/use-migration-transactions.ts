import { useEffect, useMemo, useState, useCallback } from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { ethers } from "ethers";
import { useConfiguration, useMigrations } from "@/app/contexts";
import { migrationNetwork, migrationWalletAddress } from "@/utils/polygon-migration";
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

	const transactions = await wallet.transactionIndex().received({
		limit: 11,

		// @ts-ignore
		page,
		senderId: senderIds.join(","),
	});

	return {
		cursor: Number(transactions.currentPage()),
		hasMore: transactions.items().length > 0,
		items: transactions.items(),
	};
};

export const useMigrationTransactions = ({ profile }: { profile: Contracts.IProfile }) => {
	const { profileIsRestoring } = useConfiguration();
	const { migrations, storeTransaction } = useMigrations();
	const [latestTransactions, setLatestTransactions] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);
	const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);

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

	const migrationTransactions = useMemo(
		() =>
			latestTransactions.filter((transaction) => {
				const polygonAddress = transaction.memo();

				if (!polygonAddress) {
					return false;
				}

				if (transaction.recipient() !== migrationWalletAddress()) {
					return false;
				}

				return ethers.utils.isAddress(polygonAddress);
			}),
		[latestTransactions, isLoadingTransactions],
	);

	useEffect(() => {
		for (const transaction of migrationTransactions) {
			storeTransaction(transaction);
		}
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

	return {
		hasMore,
		isLoading: page === 0 && isLoading,
		isLoadingMore: page > 0 && isLoading,
		migrations: migrations || [],
		onLoadMore: () => loadMigrationWalletTransactions(),
		page,
		resolveTransaction,
	};
};
