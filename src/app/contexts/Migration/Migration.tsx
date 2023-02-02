/* eslint-disable sonarjs/cognitive-complexity */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { uniqBy, sortBy } from "@ardenthq/sdk-helpers";
import { useConfiguration } from "../Configuration";
import { httpClient } from "@/app/services";
import {
	ARKMigrationViewStructOutput,
	Migration,
	MigrationTransaction,
	MigrationTransactionStatus,
} from "@/domains/migration/migration.contracts";
import { useProfileWatcher } from "@/app/hooks/use-profile-watcher";
import { polygonIndexerUrl, isValidMigrationTransaction } from "@/utils/polygon-migration";
import { useContract } from "@/domains/migration/hooks/use-contract";
import { useMigrationTransactions } from "@/domains/migration/hooks/use-migration-transactions";
import { useMigrationsCache } from "@/domains/migration/hooks/use-migrations-cache";
interface MigrationContextType {
	contractIsPaused?: boolean;
	migrations: Migration[];
	storeTransactions: (transactions: MigrationTransaction[]) => Promise<void>;
	getTransactionStatus: (transaction: MigrationTransaction) => Promise<MigrationTransactionStatus>;
	removeTransactions: (address: string) => void;
	markMigrationsAsRead: (ids: string[]) => void;
	loadMigrationsError: Error | undefined;
	resolveTransaction: (migration: Migration) => MigrationTransaction | undefined;
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

export const MigrationProvider = ({ children }: Properties) => {
	const profile = useProfileWatcher();
	const { profileIsSyncing } = useConfiguration();
	const { contract, contractIsPaused, getContractMigrations } = useContract();
	const {
		latestTransactions,
		isLoadingMoreTransactions,
		loadMigrationWalletTransactions,
		removeTransactions,
		page: transactionsPage,
		hasMore,
		limit,
	} = useMigrationTransactions({ profile });

	const [migrations, setMigrations] = useState<Migration[]>([]);
	const [loadMigrationsError, setLoadMigrationsError] = useState<Error>();
	const [migrationsLoaded, setMigrationsLoaded] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(true);
	const { getMigrations, storeMigrations, cacheIsReady } = useMigrationsCache({ profile });
	const [page, setPage] = useState<number>(0);

	useEffect(() => {
		setPage(transactionsPage);
	}, [transactionsPage]);

	const loadMigrationDetails = useCallback(async () => {
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

				if (migration.status === status) {
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

	const markMigrationsAsRead = useCallback(
		(ids: string[]) => {
			setMigrations((migrations) =>
				migrations.map((migration) => {
					if (ids.includes(migration.id)) {
						return {
							...migration,
							readAt: Date.now(),
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

	const getMigrationById = useCallback(
		(id: string) => migrations.find((migration) => migration.id === id),
		[migrations],
	);

	const getTransactionStatus = useCallback(
		async (transaction: MigrationTransaction) => {
			let contractMigrations: ARKMigrationViewStructOutput[];

			try {
				contractMigrations = await getContractMigrations([`0x${transaction.id()}`]);
				setLoadMigrationsError(undefined);
			} catch (error) {
				setLoadMigrationsError(error);
				return;
			}

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

	const storeTransactions = useCallback(
		async (transactions: MigrationTransaction[]) => {
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

			console.log("set migrations loaded somewhere");
			setMigrationsLoaded(true);
		},
		[getTransactionStatus],
	);

	useEffect(() => {
		const storedMigrationIds = new Set(migrations.map((migration) => migration.id));

		const newMigrationTransactions = latestTransactions.filter((transaction) => {
			if (storedMigrationIds.has(transaction.id())) {
				return false;
			}

			return isValidMigrationTransaction(transaction);
		});

		if (newMigrationTransactions.length > 0) {
			storeTransactions(newMigrationTransactions);
		}
	}, [migrations, latestTransactions, storeTransactions]);

	const readyToLoad = useMemo(
		() => contract !== undefined && profile !== undefined && cacheIsReady && !profileIsSyncing,
		[contract, profile, cacheIsReady, profileIsSyncing],
	);

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
				loadMigrationDetails();
				return;
			}

			clearInterval(reloadInterval);
		};

		reloadInterval = setInterval(reloadMigrationsCallback, MIGRATION_LOAD_INTERVAL);

		return () => clearInterval(reloadInterval);
	}, [readyToLoad, loadMigrationDetails, loadMigrationsError]);

	useEffect(() => {
		if (!readyToLoad) {
			return;
		}

		const cachedMigrations = getMigrations();

		if (
			cachedMigrations !== undefined &&
			JSON.stringify(migrations) === JSON.stringify(cachedMigrations.migrations) &&
			page === cachedMigrations.page
		) {
			console.log("Equal");
			return;
		}

		if (page === 0) {
			console.log("page not loaded yet");
			return;
		}

		storeMigrations(migrations, page);
	}, [cacheIsReady, migrations, storeMigrations, getMigrations, page]);

	useEffect(() => {
		if (!readyToLoad) {
			return;
		}

		const cachedMigrations = getMigrations();

		if (cachedMigrations !== undefined) {
			setPage(cachedMigrations.page);

			setMigrations(cachedMigrations.migrations);

			setMigrationsLoaded(true);
		}
	}, [readyToLoad, getMigrations]);

	const paginatedMigrations = useMemo(() => migrations.slice(0, page * limit), [migrations, page, limit]);

	useEffect(() => {
		setIsLoading(!migrationsLoaded || !readyToLoad);
	}, [migrationsLoaded, readyToLoad]);

	return (
		<MigrationContext.Provider
			value={
				{
					contractIsPaused,
					getMigrationById,
					getTransactionStatus,
					hasMore: hasMore && !isLoading,
					isLoading,
					isLoadingMore: isLoadingMoreTransactions,
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
