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
	contractIsPaused?: boolean;
	migrations?: Migration[];
	storeTransaction: (transaction: DTO.ExtendedSignedTransactionData) => void;
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

	const loadMigrations = useCallback(async () => {
		const storedMigrations = repository!.all();

		const transactionIds = storedMigrations.map((migration: Migration) => `0x${migration.id}`);

		let contractMigrations: ARKMigrationViewStructOutput[] = [];

		try {
			contractMigrations = await contract!.getMigrationsByArkTxHash(transactionIds);
		} catch {
			//
		}

		const updatedMigrations = storedMigrations.map((migration: Migration): Migration => {
			const contractMigration = contractMigrations.find(
				(contractMigration: ARKMigrationViewStructOutput) =>
					contractMigration.arkTxHash === `0x${migration.id}`,
			)!;

			const status =
				contractMigration.recipient === ethers.constants.AddressZero
					? MigrationTransactionStatus.Waiting
					: MigrationTransactionStatus.Confirmed;

			return {
				...migration,
				status,
			};
		});

		repository!.set(updatedMigrations);

		await migrationsUpdated(repository!.all());
	}, [repository, contract]);

	const determineIfContractIsPaused = useCallback(async () => {
		try {
			setContractIsPaused(await contract!.paused());
		} catch {
			//
		}
	}, [contract]);

	const migrationsUpdated = useCallback(
		async (migrations: Migration[]) => {
			await persist();

			setMigrations(migrations);
		},
		[persist],
	);

	const storeTransaction = useCallback(
		async (transaction: DTO.ExtendedSignedTransactionData) => {
			const migration: Migration = {
				address: transaction.sender(),
				amount: transaction.amount(),
				id: transaction.id(),
				migrationAddress: transaction.recipient(),
				status: MigrationTransactionStatus.Waiting,
				timestamp: Date.now() / 1000,
			};

			repository!.add(migration);

			await migrationsUpdated(repository!.all());
		},
		[repository, migrationsUpdated],
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

		// Determine if the contract is paused
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
		try {
			const provider = new ethers.providers.JsonRpcProvider(polygonRpcUrl());

			setContract(new Contract(polygonContractAddress(), contractABI, provider));
		} catch (error) {
			console.error(error);
		}
	}, []);

	return (
		<MigrationContext.Provider value={{ contractIsPaused, migrations, storeTransaction } as MigrationContextType}>
			{children}
		</MigrationContext.Provider>
	);
};

export const useMigrations = (): {
	migrations: Migration[] | undefined;
	storeTransaction: (transaction: DTO.ExtendedSignedTransactionData) => void;
	contractIsPaused: boolean | undefined;
} => {
	const value = React.useContext(MigrationContext);

	if (value === undefined) {
		throw new Error("[useMigrations] Component not wrapped within a Provider");
	}

	return value;
};
