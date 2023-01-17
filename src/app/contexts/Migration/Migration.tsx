import React, { useCallback, useEffect, useState } from "react";
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
					// @TBD uncomment once available
					// {
					// 	internalType: "bytes32",
					// 	name: "txHash",
					// 	type: "bytes32",
					// },
				],
				internalType: "struct ARKMigrator.ARKMigrationView[]",
				name: "",
				type: "tuple[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
];

interface MigrationContextType {
	migrations?: Migration[];
	storeTransaction: (transaction: DTO.ExtendedSignedTransactionData) => void;
}

interface Properties {
	children: React.ReactNode;
	defaultConfiguration?: any;
}

const MigrationContext = React.createContext<any>(undefined);

export const MigrationProvider = ({ children }: Properties) => {
	const [repository, setRepository] = useState<MigrationRepository>();
	const { env, persist } = useEnvironmentContext();
	const profile = useProfileWatcher();
	const [migrations, setMigrations] = useState<Migration[]>();

	const loadMigrations = useCallback(async () => {
		const storedMigrations = repository!.all();

		const transactionIds = storedMigrations.map((migration: Migration) => `0x${migration.id}`);

		const provider = new ethers.providers.JsonRpcProvider(polygonRpcUrl());

		const contract = new Contract(polygonContractAddress(), contractABI, provider);

		let contractMigrations: ARKMigrationViewStructOutput[] = [];

		try {
			contractMigrations = await contract.getMigrationsByArkTxHash(transactionIds);
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
				migrationId: contractMigration.txHash || "test-tx-hash",
				status,
			};
		});

		repository!.set(updatedMigrations);

		await migrationsUpdated(repository!.all());
	}, [repository]);

	const migrationsUpdated = useCallback(
		async (migrations: Migration[]) => {
			await persist();

			setMigrations(migrations);
		},
		[persist],
	);

	useEffect(() => {
		setMigrations(undefined);

		if (profile) {
			setRepository(new MigrationRepository(profile, env.data()));
		} else {
			setRepository(undefined);
		}
	}, [profile, env]);

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

	useEffect(() => {
		// Migrations not loaded yet
		if (migrations === undefined && repository !== undefined) {
			loadMigrations();
		} else if (repository === undefined) {
			return;
		}

		const reloadIntervalCallback = () => {
			if (repository === undefined || !repository.hasPending()) {
				clearInterval(reloadInterval);
				return;
			}

			loadMigrations();
		};

		const reloadInterval = setInterval(reloadIntervalCallback, 1000);

		return () => clearInterval(reloadInterval);
	}, [repository, loadMigrations, migrations]);

	return (
		<MigrationContext.Provider value={{ migrations, storeTransaction } as MigrationContextType}>
			{children}
		</MigrationContext.Provider>
	);
};

export const useMigrations = (): {
	migrations: Migration[] | undefined;
	storeTransaction: (transaction: DTO.ExtendedSignedTransactionData) => void;
} => {
	const value = React.useContext(MigrationContext);

	if (value === undefined) {
		throw new Error("[useMigrations] Component not wrapped within a Provider");
	}

	return value;
};
