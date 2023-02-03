/* eslint-disable sonarjs/cognitive-complexity */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { uniqBy, sortBy } from "@ardenthq/sdk-helpers";
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
	const { contract, contractIsPaused, getContractMigrations } = useContract();
	const {
		isLoading: isLoadingTransactions,
		latestTransactions,
		loadMigrationWalletTransactions,
		removeTransactions,
		page: transactionsPage,
		hasMore,
		limit,
	} = useMigrationTransactions({ profile });

	const [migrations, setMigrations] = useState<Migration[]>([]);
	const [loadMigrationsError, setLoadMigrationsError] = useState<Error>();
	const [migrationsLoaded, setMigrationsLoaded] = useState<boolean>(false);
	const { getMigrations, storeMigrations, cacheIsReady } = useMigrationsCache({ profile });
	const [page, setPage] = useState<number>(1);
	const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

	useEffect(() => {
		if (!isLoadingTransactions && latestTransactions.length === 0) {
			setMigrationsLoaded(true);
		}
	}, [isLoadingTransactions, latestTransactions]);

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

		const updatedMigrations = pendingMigrations
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

		const newlyConfirmedMigrations = updatedMigrations.filter(
			(migration) => migration.status === MigrationTransactionStatus.Confirmed && !migration.migrationId,
		);

		if (newlyConfirmedMigrations.length > 0) {
			const polygonMigrations = await fetchPolygonMigrations(
				newlyConfirmedMigrations.map((migration: Migration) => migration.id),
			);

			for (const polygonMigration of polygonMigrations) {
				const confirmedMigration = newlyConfirmedMigrations.find(
					(migration) => migration.id === polygonMigration.arkTxHash,
				);

				if (confirmedMigration) {
					const migrationIndex = updatedMigrations.findIndex(
						(migration) => migration.id === confirmedMigration.id,
					);

					updatedMigrations[migrationIndex].migrationId = polygonMigration.polygonTxHash;
				}
			}
		}

		setMigrations((migrations) => uniqBy([...updatedMigrations, ...migrations], (migration) => migration.id));
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

			setMigrationsLoaded(true);

			setIsLoadingMore(false);

			setPage(transactionsPage);
		},
		[getTransactionStatus, transactionsPage],
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
		() => contract !== undefined && profile !== undefined && cacheIsReady,
		[contract, profile, cacheIsReady],
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

		if (cachedMigrations !== undefined && JSON.stringify(migrations) === JSON.stringify(cachedMigrations)) {
			return;
		}

		storeMigrations(migrations);
	}, [cacheIsReady, migrations, storeMigrations, getMigrations]);

	useEffect(() => {
		if (!readyToLoad) {
			return;
		}

		const cachedMigrations = getMigrations();

		if (cachedMigrations !== undefined) {
			setMigrations(cachedMigrations);

			setPage(1);

			setMigrationsLoaded(true);
		}
	}, [readyToLoad, getMigrations]);

	const paginatedMigrations = useMemo(() => migrations.slice(0, page * limit), [migrations, page, limit]);

	const isLoading = useMemo(() => !migrationsLoaded || !readyToLoad, [migrationsLoaded, readyToLoad]);

	useEffect(() => {
		if (!readyToLoad) {
			setMigrations([]);
			setMigrationsLoaded(false);
			setPage(1);
		}
	}, [readyToLoad]);

	const onLoadMore = useCallback(async () => {
		if (migrationsLoaded) {
			setIsLoadingMore(true);
		}

		await loadMigrationWalletTransactions();
	}, [loadMigrationWalletTransactions, migrationsLoaded]);

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
					onLoadMore,
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
