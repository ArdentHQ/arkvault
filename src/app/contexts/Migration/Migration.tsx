import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DTO } from "@ardenthq/sdk-profiles";
import { ethers, Contract } from "ethers";
import {
	ARKMigrationViewStructOutput,
	Migration,
	MigrationTransaction,
	MigrationTransactionStatus,
} from "@/domains/migration/migration.contracts";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { MigrationRepository } from "@/repositories/migration.repository";
import { useProfileWatcher } from "@/app/hooks/use-profile-watcher";
import { polygonContractAddress, polygonRpcUrl } from "@/utils/polygon-migration";

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
	getTransactionStatus: (
		transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData,
	) => Promise<MigrationTransactionStatus>;
	contractIsPaused?: boolean;
	migrations: MigrationTransaction[] | undefined;
	storeTransactions: (
		transactions: (DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData)[],
	) => Promise<void>;
}

interface Properties {
	children: React.ReactNode;
	defaultConfiguration?: any;
}

const MigrationContext = React.createContext<any>(undefined);

const ONE_SECOND = 1000;

const ONE_MINUTE = 60 * ONE_SECOND;

export const MigrationProvider = ({ children }: Properties) => {
	const [repository, setRepository] = useState<MigrationRepository>();
	const { env, persist } = useEnvironmentContext();
	const profile = useProfileWatcher();
	const [migrations, setMigrations] = useState<MigrationTransaction[]>();
	const [contract, setContract] = useState<Contract>();
	const [contractIsPaused, setContractIsPaused] = useState<boolean>();
	const { profileIsSyncingWallets, profileIsSyncing } = useConfiguration();

	const getContractMigrations = useCallback(
		async (transactionIds: string[]) => {
			let contractMigrations: ARKMigrationViewStructOutput[] = [];

			try {
				contractMigrations = await contract!.getMigrationsByArkTxHash(transactionIds);
			} catch {
				//
			}

			return contractMigrations;
		},
		[contract],
	);

	const getTransactionStatus = useCallback(
		async (transaction: MigrationTransaction["transaction"]) => {
			const contractMigrations = await getContractMigrations([`0x${transaction.id()}`]);

			const contractMigration = contractMigrations.find(
				(contractMigration: ARKMigrationViewStructOutput) =>
					contractMigration.arkTxHash === `0x${transaction.id()}`,
			);

			return contractMigration!.recipient === ethers.constants.AddressZero
				? MigrationTransactionStatus.Pending
				: MigrationTransactionStatus.Confirmed;
		},
		[contract, getContractMigrations],
	);

	const getMigrationTransaction = useCallback(
		(migration: Migration) => {
			const wallet = profile!.wallets().findById(migration.walletId);
			return wallet.transactionIndex().findById(migration.transactionId);
		},
		[profile],
	);

	const migrationsUpdated = useCallback(async () => {
		const migrations = repository!.all();

		const migrationTransactions: MigrationTransaction[] = [];

		const transactions = await Promise.all(
			migrations.map((migration: Migration) => getMigrationTransaction(migration)),
		);

		for (const [index, migration] of migrations.entries()) {
			migrationTransactions.push({
				status: migration.status,
				transaction: transactions[index],
			});
		}

		setMigrations(migrationTransactions);

		await persist();
	}, [persist, profile, repository]);

	const loadMigrations = useCallback(async () => {
		const storedMigrations = repository!.all();

		const transactionIds = storedMigrations.map((migration: Migration) => `0x${migration.transactionId}`);

		const contractMigrations = await getContractMigrations(transactionIds);

		const updatedMigrations = storedMigrations.map((migration: Migration): Migration => {
			const contractMigration = contractMigrations.find(
				(contractMigration: ARKMigrationViewStructOutput) =>
					contractMigration.arkTxHash === `0x${migration.transactionId}`,
			)!;

			const status =
				contractMigration.recipient === ethers.constants.AddressZero
					? MigrationTransactionStatus.Pending
					: MigrationTransactionStatus.Confirmed;

			return {
				...migration,
				status,
			};
		});

		repository!.set(updatedMigrations);

		await migrationsUpdated();
	}, [repository, getContractMigrations, migrationsUpdated]);

	const determineIfContractIsPaused = useCallback(async () => {
		try {
			setContractIsPaused(await contract!.paused());
		} catch {
			//
		}
	}, [contract]);

	const storeTransactions = useCallback(
		async (transactions: (DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData)[]) => {
			const migrations: Migration[] = transactions.map((transaction) => ({
				status: MigrationTransactionStatus.Pending,
				transactionId: transaction.id(),
				walletId: transaction.wallet().id(),
			}));

			for (const migration of migrations) {
				repository!.add(migration);
			}

			await migrationsUpdated();
		},
		[repository, migrationsUpdated],
	);

	const isReady = useMemo(
		() =>
			repository !== undefined &&
			contract !== undefined &&
			profileIsSyncingWallets === false &&
			profileIsSyncing === false,
		[contract, repository, profileIsSyncingWallets, profileIsSyncing],
	);

	useEffect(() => {
		let reloadInterval: ReturnType<typeof setInterval>;

		if (!isReady) {
			return;
		}

		// Load migrations for the first time if there are pending migrations
		if (migrations === undefined) {
			loadMigrations();
			return;
		}

		const reloadMigrationsCallback = () => {
			if (!repository!.hasPending()) {
				clearInterval(reloadInterval);
				return;
			}

			loadMigrations();
		};

		reloadInterval = setInterval(reloadMigrationsCallback, ONE_SECOND);

		return () => clearInterval(reloadInterval);
	}, [repository, loadMigrations, migrations, isReady]);

	useEffect(() => {
		let reloadInerval: ReturnType<typeof setInterval>;

		if (!isReady) {
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
	}, [repository, determineIfContractIsPaused, isReady, contractIsPaused]);

	// Initialize repository when a new profile is loaded
	useEffect(() => {
		setMigrations(undefined);

		if (profile) {
			setRepository(new MigrationRepository(profile, env.data()));
		} else {
			setRepository(undefined);
		}
	}, [profile, env]);

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
					getTransactionStatus,
					migrations,
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
