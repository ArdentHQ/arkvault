import { useEffect, useMemo, useState, useCallback } from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { ethers } from "ethers";
import { useConfiguration, useMigrations } from "@/app/contexts";
import { migrationNetwork, migrationWalletAddress } from "@/utils/polygon-migration";

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
			items: [],
			hasMore: false,
			cursor: page,
		};
	}

	const transactions = await wallet.transactionIndex().received({
		senderId: senderIds.join(","),
		// @ts-ignore
		page,
		limit: 11,
	});

	return {
		hasMore: transactions.items().length > 0,
		items: transactions.items(),
		cursor: Number(transactions.currentPage()),
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

		const { items, hasMore, cursor } = await fetchMigrationTransactions({ profile, page: page + 1 });

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

	const isLoading = () => {
		if (profileIsRestoring) {
			return true;
		}

		if (isLoadingTransactions) {
			return true;
		}

		return migrationTransactions.length > 0 && !migrations;
	};

	return {
		hasMore,
		isLoading: page === 0 && isLoading(),
		migrations: migrations || [],
		page,
		onLoadMore: () => loadMigrationWalletTransactions(),
		isLoadingMore: page > 0 && isLoading(),
	};
};
