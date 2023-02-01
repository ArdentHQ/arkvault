/* eslint-disable sonarjs/cognitive-complexity */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { ethers } from "ethers";
import { uniqBy, sortBy, BigNumber } from "@ardenthq/sdk-helpers";
import { httpClient } from "@/app/services";
import {
	ARKMigrationViewStructOutput,
	Migration,
	MigrationTransactionStatus,
} from "@/domains/migration/migration.contracts";
import { useProfileWatcher } from "@/app/hooks/use-profile-watcher";
import {
	polygonIndexerUrl,
	migrationMinBalance,
	migrationNetwork,
	migrationTransactionFee,
	migrationWalletAddress,
	polygonMigrationStartTime,
	isValidMigrationTransaction,
} from "@/utils/polygon-migration";

import { useContract } from "@/domains/migration/hooks/use-contract";

interface MigrationContextType {
	contractIsPaused?: boolean;
	migrations: Migration[];
	storeTransactions: (
		transactions: (DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData)[],
	) => Promise<void>;
	getTransactionStatus: (transaction: DTO.ExtendedConfirmedTransactionData) => Promise<MigrationTransactionStatus>;
	removeTransactions: (address: string) => void;
	markMigrationsAsRead: (ids: string[]) => void;
	loadMigrationsError: Error | undefined;
	resolveTransaction: (migration: Migration) => DTO.ExtendedConfirmedTransactionData | undefined;
	paginatedMigrations: Migration[];
	isLoading: boolean;
	isLoadingMore: boolean;
	getMigrationById: (id: string) => Migration | undefined;
	hasMore: boolean;
	onLoadMore: () => void;
	page: number;
}

interface Properties {
	children: React.ReactNode;
	defaultConfiguration?: any;
}

const MigrationContext = React.createContext<any>(undefined);

const MIGRATION_LOAD_INTERVAL = 5000;

const fetchPolygonMigrations = async (arkTxHashes: string[]) => {
	const response = await httpClient.get(`${polygonIndexerUrl()}transactions`, {
		arkTxHashes: arkTxHashes,
	});

	return JSON.parse(response.body());
};

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

export const MigrationProvider = ({ children }: Properties) => {
	const { contract, contractIsPaused, getContractMigrations } = useContract();

	const profile = useProfileWatcher();
	const [migrations, setMigrations] = useState<Migration[]>([]);

	const [loadMigrationsError, setLoadMigrationsError] = useState<Error>();
	const [latestTransactions, setLatestTransactions] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);
	const [transactionsLoaded, setTransactionsLoaded] = useState<boolean>(false);
	const [migrationsLoaded, setMigrationsLoaded] = useState<boolean>(false);
	const [isLoadingMore, setIsLoadingMore] = useState(true);

	const limit = 11;

	const loadMigrationWalletTransactions = useCallback(async () => {
		if (transactionsLoaded) {
			setIsLoadingMore(true);
		}

		const { items, hasMore, cursor } = await fetchMigrationTransactions({
			limit,
			page: page + 1,
			profile: profile!,
		});

		setLatestTransactions((existingItems) => [...existingItems, ...items]);
		setHasMore(hasMore);
		setPage(cursor);
		setTransactionsLoaded(true);
	}, [profile, page, hasMore, transactionsLoaded]);

	const getTransactionStatus = useCallback(
		async (transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData) => {
			const contractMigrations = await getContractMigrations([`0x${transaction.id()}`]);

			const contractMigration = contractMigrations.find(
				(contractMigration: ARKMigrationViewStructOutput) =>
					contractMigration.arkTxHash === `0x${transaction.id()}`,
			);

			return contractMigration!.recipient === ethers.constants.AddressZero
				? MigrationTransactionStatus.Pending
				: MigrationTransactionStatus.Confirmed;
		},
		[getContractMigrations],
	);

	const reloadMigrationsDetails = useCallback(async () => {
		const pendingMigrations = migrations.filter(
			(migration) => migration.status === MigrationTransactionStatus.Pending || migration.status === undefined,
		);

		const transactionIds = pendingMigrations.map((migration: Migration) => `0x${migration.id}`);

		let contractMigrations: ARKMigrationViewStructOutput[] = [];

		try {
			contractMigrations = await getContractMigrations(transactionIds);
			setLoadMigrationsError(undefined);
		} catch (error) {
			setLoadMigrationsError(error);
		}

		let updatedMigrations = pendingMigrations
			.map((migration: Migration): Migration | undefined => {
				const contractMigration = contractMigrations.find(
					(contractMigration: ARKMigrationViewStructOutput) =>
						contractMigration.arkTxHash === `0x${migration.id}`,
				);

				let status: MigrationTransactionStatus | undefined;

				if (contractMigration) {
					status =
						contractMigration.recipient === ethers.constants.AddressZero
							? MigrationTransactionStatus.Pending
							: MigrationTransactionStatus.Confirmed;
				}

				if (migration.status === status && migration.migrationId) {
					return;
				}

				return {
					...migration,
					status,
				};
			})
			.filter(Boolean) as Migration[];

		updatedMigrations = uniqBy([...updatedMigrations, ...migrations], (migration) => migration.id);

		setMigrations(updatedMigrations);
	}, [migrations, getContractMigrations]);

	const storeTransactions = useCallback(
		async (transactions: (DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData)[]) => {
			const newMigrations: Migration[] = [];

			for (const transaction of transactions) {
				const status = await getTransactionStatus(transaction);

				const migration: Migration = {
					address: transaction.sender(),
					amount: transaction.amount(),
					id: transaction.id(),
					migrationAddress: transaction.memo()!,
					status,
					timestamp: transaction.timestamp()!.toUNIX(),
				};

				if (status === MigrationTransactionStatus.Confirmed) {
					const [polygonMigration] = await fetchPolygonMigrations([migration.id]);
					migration.migrationId = polygonMigration.polygonTxHash;
				}

				newMigrations.push(migration);
			}

			if (newMigrations.length > 0) {
				setMigrations((migrations) => [...migrations, ...newMigrations]);
			}

			// Setting the following values because we want to hide the loading
			// indicator until we have loaded all the migration details for the
			// transactions.
			setMigrationsLoaded(true);
			setIsLoadingMore(false);
		},
		[getTransactionStatus],
	);

	const removeTransactions = (address: string) => {
		setMigrations((migrations) => migrations.filter((migration) => migration.address !== address));
	};

	const markMigrationsAsRead = useCallback(
		(ids: string[]) => {
			setMigrations((migrations) =>
				migrations.map((migration) => {
					if (ids.includes(migration.id)) {
						return {
							...migration,
							read: true,
						};
					}

					return migration;
				}),
			);
		},
		[migrations],
	);

	const sortedMigrations = useMemo(() => sortBy(migrations, (migration) => -migration.timestamp), [migrations]);

	const resolveTransaction = useCallback(
		(migration: Migration) => latestTransactions.find((transaction) => transaction.id() === migration.id),
		[latestTransactions],
	);

	const isLoading = useMemo<boolean>(() => !migrationsLoaded, [migrationsLoaded]);

	const paginatedMigrations = useMemo(() => migrations.slice(0, page * limit), [migrations, page, limit]);

	const getMigrationById = useCallback(
		(id: string) => migrations.find((migration) => migration.id === id),
		[migrations],
	);

	useEffect(() => {
		const storedMigrationIds = new Set(migrations.map((migration) => migration.id));

		const migrationTransactions = latestTransactions.filter((transaction) => {
			if (storedMigrationIds.has(transaction.id())) {
				return false;
			}

			return isValidMigrationTransaction(transaction);
		});

		if (migrationTransactions.length > 0) {
			storeTransactions(migrationTransactions);
		}
	}, [migrations, latestTransactions, storeTransactions]);

	const readyToLoad = useMemo(() => contract !== undefined && profile !== undefined, [contract, profile]);

	useEffect(() => {
		let reloadInterval: ReturnType<typeof setInterval>;

		if (!readyToLoad) {
			return;
		}

		const reloadMigrationsCallback = () => {
			const hasSomePendingMigrations = migrations.some(
				(migration) =>
					migration.status === MigrationTransactionStatus.Pending || migration.status === undefined,
			);

			if (hasSomePendingMigrations || loadMigrationsError) {
				reloadMigrationsDetails();
				return;
			}

			clearInterval(reloadInterval);
		};

		reloadInterval = setInterval(reloadMigrationsCallback, MIGRATION_LOAD_INTERVAL);

		return () => clearInterval(reloadInterval);
	}, [readyToLoad, reloadMigrationsDetails, loadMigrationsError]);

	useEffect(() => {
		if (readyToLoad) {
			if (!transactionsLoaded) {
				loadMigrationWalletTransactions();
			}
		} else {
			setTransactionsLoaded(false);
			setLatestTransactions([]);
			setMigrations([]);
		}
	}, [readyToLoad, transactionsLoaded, loadMigrationWalletTransactions]);

	return (
		<MigrationContext.Provider
			value={
				{
					contractIsPaused,
					getMigrationById,
					getTransactionStatus,
					hasMore: hasMore && !isLoading,
					isLoading,
					isLoadingMore,
					loadMigrationsError,
					markMigrationsAsRead,
					migrations: sortedMigrations,
					onLoadMore: () => loadMigrationWalletTransactions(),
					page,
					paginatedMigrations,
					removeTransactions,
					resolveTransaction,
					storeTransactions,
				} as MigrationContextType
			}
		>
			{children}
		</MigrationContext.Provider>
	);
};

export const useMigrations = (): MigrationContextType => {
	const value = React.useContext(MigrationContext);

	if (value === undefined) {
		throw new Error("[useMigrations] Component not wrapped within a Provider");
	}

	return value;
};
