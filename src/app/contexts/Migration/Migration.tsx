/* eslint-disable sonarjs/cognitive-complexity */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { ethers, Contract } from "ethers";
import { uniqBy, sortBy, BigNumber } from "@ardenthq/sdk-helpers";
import { matchPath, useLocation } from "react-router-dom";
import { httpClient } from "@/app/services";
import {
	ARKMigrationViewStructOutput,
	Migration,
	MigrationTransactionStatus,
} from "@/domains/migration/migration.contracts";
import { useEnvironmentContext } from "@/app/contexts";
import { MigrationRepository } from "@/repositories/migration.repository";
import { useProfileWatcher } from "@/app/hooks/use-profile-watcher";
import {
	polygonContractAddress,
	polygonIndexerUrl,
	polygonRpcUrl,
	migrationMinBalance,
	migrationNetwork,
	migrationTransactionFee,
	migrationWalletAddress,
	polygonMigrationStartTime,
	isValidMigrationTransaction,
} from "@/utils/polygon-migration";
import { waitFor } from "@/utils/wait-for";

const contractABI = [
	{
		inputs: [
			{
				internalType: "bytes32[]",
				name: "arkTxHashes",
				type: "bytes32[]",
			},
		],
		name: "getMigrationsByArkTxHash",
		outputs: [
			{
				components: [
					{
						internalType: "address",
						name: "recipient",
						type: "address",
					},
					{
						internalType: "uint96",
						name: "amount",
						type: "uint96",
					},
					{
						internalType: "bytes32",
						name: "arkTxHash",
						type: "bytes32",
					},
				],
				internalType: "struct ARKMigrator.ARKMigrationView[]",
				name: "",
				type: "tuple[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "paused",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
];

interface MigrationContextType {
	contractIsPaused?: boolean;
	migrations: Migration[];
	storeTransactions: (
		transactions: (DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData)[],
	) => Promise<void>;
	getTransactionStatus: (transaction: DTO.ExtendedConfirmedTransactionData) => Promise<MigrationTransactionStatus>;
	removeTransactions: (address: string) => Promise<void>;
	markMigrationsAsRead: (ids: string[]) => void;
	loadMigrationsError: Error | undefined;
	migrationsLoaded: boolean;
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

const ONE_MINUTE = 60 * 1000;

const GET_MIGRATIONS_MAX_TRIES = 5;
const GET_MIGRATIONS_TRY_INTERVAL = 1000;

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
	const [repository, setRepository] = useState<MigrationRepository>();
	const { env, persist } = useEnvironmentContext();
	const profile = useProfileWatcher();
	const [migrations, setMigrations] = useState<Migration[]>([]);
	const [contract, setContract] = useState<Contract>();
	const [contractIsPaused, setContractIsPaused] = useState<boolean>();
	const { pathname } = useLocation();
	const [loadMigrationsError, setLoadMigrationsError] = useState<Error>();
	const [latestTransactions, setLatestTransactions] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);
	const [migrationsLoaded, setMigrationsLoaded] = useState<boolean>(false);
	const [transactionsLoaded, setTransactionsLoaded] = useState<boolean>(false);
	const [isLoadingMore, setIsLoadingMore] = useState(true);

	const isMigrationPath = useMemo(
		() => !!matchPath(pathname, { path: "/profiles/:profileId/migration" }),
		[pathname],
	);

	const migrationsUpdated = useCallback(
		async (migrations: Migration[]) => {
			await persist();

			setMigrations(migrations);
		},
		[persist],
	);

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
		setIsLoadingMore(false);
	}, [profile, page, hasMore, transactionsLoaded]);

	const getContractMigrations = useCallback(
		async (transactionIds: string[], tries = 0): Promise<ARKMigrationViewStructOutput[]> => {
			try {
				return await contract!.getMigrationsByArkTxHash(transactionIds);
			} catch (error) {
				if (tries > GET_MIGRATIONS_MAX_TRIES) {
					throw error;
				}

				// Wait a second to try again
				await waitFor(GET_MIGRATIONS_TRY_INTERVAL);

				return getContractMigrations(transactionIds, tries + 1);
			}
		},
		[contract],
	);

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

	const loadMigrations = useCallback(async () => {
		/* istanbul ignore next -- @preserve */
		if (!contract || !repository) {
			return;
		}

		const storedMigrations = repository.all();

		const pendingMigrations = storedMigrations.filter(
			(migration) =>
				migration.status === MigrationTransactionStatus.Pending ||
				migration.status === undefined ||
				!migration.migrationId,
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

				if (migration.status === status && migration.migrationId) {
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

		if (updatedMigrations.length > 0) {
			const migrations = uniqBy([...updatedMigrations, ...repository.all()], (migration) => migration.id);

			repository.set(migrations);

			await migrationsUpdated(repository.all());
		}

		setMigrationsLoaded(true);
	}, [repository, getContractMigrations, migrationsUpdated, isMigrationPath]);

	const determineIfContractIsPaused = useCallback(async () => {
		try {
			setContractIsPaused(await contract!.paused());
		} catch {
			//
		}
	}, [contract]);

	const storeTransactions = useCallback(
		async (transactions: (DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData)[]) => {
			/* istanbul ignore next -- @preserve */
			if (!repository) {
				return;
			}

			const storedMigrations = repository.all();

			const newTransactions = transactions.filter(
				(transaction) => !storedMigrations.some((migration) => migration.id === transaction.id()),
			);

			for (const transaction of newTransactions) {
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

				repository.add(migration);
			}

			if (transactions.length > 0) {
				await migrationsUpdated(repository.all());
			}
		},
		[repository, migrationsUpdated, getTransactionStatus],
	);

	const removeTransactions = useCallback(
		async (address: string) => {
			/* istanbul ignore next -- @preserve */
			if (!migrations || !repository) {
				return;
			}

			repository.remove(migrations.filter((migration) => migration.address === address));

			await migrationsUpdated(repository.all());
		},
		[migrations, repository, migrationsUpdated],
	);

	const hasContractAndRepository = useMemo(
		() => repository !== undefined && contract !== undefined,
		[contract, repository],
	);

	useEffect(() => {
		let reloadInerval: ReturnType<typeof setInterval>;

		if (!hasContractAndRepository) {
			return;
		}

		if (contractIsPaused === undefined) {
			determineIfContractIsPaused();
			return;
		}

		const reloadPausedStateCallback = () => {
			determineIfContractIsPaused();
		};

		if (contractIsPaused !== undefined) {
			reloadInerval = setInterval(reloadPausedStateCallback, ONE_MINUTE);
		}

		return () => clearInterval(reloadInerval);
	}, [determineIfContractIsPaused, hasContractAndRepository, contractIsPaused]);

	const markMigrationsAsRead = useCallback(
		(ids: string[]) => {
			repository?.markAsRead(ids);
			migrationsUpdated(repository!.all());
		},
		[repository, migrationsUpdated],
	);

	const migrationsSorted = useMemo(() => sortBy(migrations, (migration) => -migration.timestamp), [migrations]);

	const resolveTransaction = useCallback(
		(migration: Migration) => latestTransactions.find((transaction) => transaction.id() === migration.id),
		[latestTransactions],
	);

	const isLoading = useMemo(() => !migrationsLoaded && !transactionsLoaded, [migrationsLoaded, transactionsLoaded]);

	const paginatedMigrations = useMemo(() => migrations.slice(0, page * limit), [migrations, page, limit]);

	const getMigrationById = useCallback(
		(id: string) => migrations.find((migration) => migration.id === id),
		[migrations],
	);

	// Look into the loaded migration transactions and store the new ones
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

	// When the contract and repository is set, call the method that load
	// the status of the current stored migrations and the method that load
	// the migration transactions from the network.
	useEffect(() => {
		let reloadInterval: ReturnType<typeof setInterval>;

		if (!hasContractAndRepository) {
			return;
		}

		// Load migrations immediatly if no loaded yet
		if (!migrationsLoaded) {
			loadMigrations();

			loadMigrationWalletTransactions();
		}

		const reloadMigrationsCallback = () => {
			if (!repository!.hasPending() && !repository!.hasWithoutMigrationId() && !loadMigrationsError) {
				clearInterval(reloadInterval);
				return;
			}

			loadMigrations();
		};

		reloadInterval = setInterval(reloadMigrationsCallback, MIGRATION_LOAD_INTERVAL);

		return () => clearInterval(reloadInterval);
	}, [repository, loadMigrations, migrationsLoaded, hasContractAndRepository, loadMigrationsError]);

	// Initialize repository when a new profile is loaded
	useEffect(() => {
		if (contract === undefined) {
			return;
		}

		if (profile) {
			const repository = new MigrationRepository(profile, env.data());
			setRepository(repository);
			console.log({ all: repository.all() });
			setMigrations(repository.all());
		} else {
			setMigrationsLoaded(false);
			setRepository(undefined);
			setMigrations([]);
		}
	}, [profile, env, contract]);

	// Create contract instance when context is created
	useEffect(() => {
		const contractAddress = polygonContractAddress();

		if (contractAddress === undefined) {
			return;
		}

		const provider = new ethers.providers.JsonRpcProvider(polygonRpcUrl());

		setContract(new Contract(contractAddress, contractABI, provider));
	}, []);

	return (
		<MigrationContext.Provider
			value={
				{
					contractIsPaused,
					getMigrationById,
					getTransactionStatus,
					hasMore,
					isLoading,
					isLoadingMore: isLoadingMore,
					loadMigrationsError,
					markMigrationsAsRead,
					migrations: migrationsSorted,

					migrationsLoaded,

					onLoadMore: () => loadMigrationWalletTransactions(),

					page,

					// @TODO: use-transactions use this as migrations
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
