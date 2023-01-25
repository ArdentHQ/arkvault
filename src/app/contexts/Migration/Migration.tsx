import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DTO } from "@ardenthq/sdk-profiles";
import { ethers, Contract } from "ethers";
import {
	ARKMigrationViewStructOutput,
	Migration,
	MigrationTransactionStatus,
} from "@/domains/migration/migration.contracts";
import { useEnvironmentContext } from "@/app/contexts";
import { MigrationRepository } from "@/repositories/migration.repository";
import { useProfileWatcher } from "@/app/hooks/use-profile-watcher";
import { httpClient } from "@/app/services";
import { polygonContractAddress, polygonIndexerUrl, polygonRpcUrl } from "@/utils/polygon-migration";

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
	migrations?: Migration[];
	storeTransactions: (
		transactions: (DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData)[],
	) => Promise<void>;
	getTransactionStatus: (transaction: DTO.ExtendedConfirmedTransactionData) => Promise<MigrationTransactionStatus>;
	removeTransactions: (address: string) => Promise<void>;
	markMigrationAsRead: (migration: Migration) => void;
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
	const [migrations, setMigrations] = useState<Migration[]>();
	const [contract, setContract] = useState<Contract>();
	const [contractIsPaused, setContractIsPaused] = useState<boolean>();

	const migrationsUpdated = useCallback(
		async (migrations: Migration[]) => {
			await persist();

			setMigrations(migrations);
		},
		[persist],
	);

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
		async (transaction: DTO.ExtendedConfirmedTransactionData) => {
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

	const loadMigrations = useCallback(async () => {
		/* istanbul ignore next -- @preserve */
		if (!contract || !repository) {
			return;
		}

		const storedMigrations = repository.all();

		const pendingMigrations = storedMigrations.filter(
			(migration) => migration.status === MigrationTransactionStatus.Pending || !migration.migrationId,
		);

		const transactionIds = pendingMigrations.map((migration: Migration) => `0x${migration.id}`);

		let contractMigrations: ARKMigrationViewStructOutput[] = [];

		try {
			contractMigrations = await contract.getMigrationsByArkTxHash(transactionIds);
		} catch {
			//
		}

		const confirmedCountBefore = storedMigrations.filter(
			(migration) => migration.status === MigrationTransactionStatus.Confirmed,
		).length;

		const updatedMigrations = pendingMigrations.map((migration: Migration): Migration => {
			const contractMigration = contractMigrations.find(
				(contractMigration: ARKMigrationViewStructOutput) =>
					contractMigration.arkTxHash === `0x${migration.id}`,
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

		const newlyConfirmedMigrations = updatedMigrations.filter(
			(migration) => migration.status === MigrationTransactionStatus.Confirmed && !migration.migrationId,
		);

		if (newlyConfirmedMigrations.length > 0) {
			const response = await httpClient.get(`${polygonIndexerUrl()}transactions`, {
				arkTxHashes: newlyConfirmedMigrations.map((migration: Migration) => migration.id),
			});

			for (const polygonMigration of JSON.parse(response.body())) {
				const confirmedMigration = newlyConfirmedMigrations.find(
					(migration) => migration.id === polygonMigration.arkTxHash,
				);

				if (confirmedMigration) {
					confirmedMigration.migrationId = polygonMigration.polygonTxHash;
				}
			}
		}

		if (newlyConfirmedMigrations.length > 0) {
			for (const migration of newlyConfirmedMigrations) {
				repository.add(migration);
			}

			await migrationsUpdated(repository.all());
		}
	}, [repository, contract, migrationsUpdated]);

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

			for (const transaction of transactions) {
				const migration: Migration = {
					address: transaction.sender(),
					amount: transaction.amount(),
					id: transaction.id(),
					migrationAddress: transaction.memo()!,
					status: MigrationTransactionStatus.Pending,
					timestamp: transaction.timestamp()!.toUNIX(),
				};

				repository.add(migration);
			}

			await migrationsUpdated(repository.all());
		},
		[repository, migrationsUpdated],
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
		let reloadInterval: ReturnType<typeof setInterval>;

		if (!hasContractAndRepository) {
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
	}, [repository, loadMigrations, migrations, hasContractAndRepository]);

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
	}, [repository, determineIfContractIsPaused, hasContractAndRepository, contractIsPaused]);

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

	const markMigrationAsRead = useCallback(
		(migration: Migration) => {
			repository!.markAsRead(migration);

			migrationsUpdated(repository!.all());
		},
		[repository, migrationsUpdated],
	);

	return (
		<MigrationContext.Provider
			value={
				{
					contractIsPaused,
					getTransactionStatus,
					markMigrationAsRead,
					migrations,
					removeTransactions,
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
