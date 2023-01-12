import React, { useCallback, useEffect, useState } from "react";
import { ethers, Contract } from "ethers";
import {
	ARKMigrationViewStructOutput,
	Migration,
	MigrationTransactionStatus,
} from "@/domains/migration/migration.contracts";
import { useEnvironmentContext } from "@/app/contexts";
import { MigrationRepository } from "@/repositories/migration.repository";
import { useProfileWatcher } from "@/app/hooks/use-profile-watcher";

const CONTRACT_ADDRESS = import.meta.env.VITE_POLYGON_CONTRACT_ADDRESS;
const POLYGON_RPC_URL = import.meta.env.VITE_POLYGON_RPC_URL;

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
];

// @TODO: make this transactions dynamic, an option is to store/get using the
// env storage, e.g. env.storage().get("ark-migration-transactions")
const fakeTransactionsIds = [
	// Invalid one
	"0x74a1e612846da4c3da618a77e82e6f8468fd88459662738babce5b6014b023f4",
	// Valid ones
	"0x2c00cb87957dd47ee9e6a03210bf2ca46ba7a11156391d3b5960760846de226a",
	"0x5e4f8256caffe7d7276da0611bcf8a8bff8aea1219853ea07d9575355efff704",
];

const transactionMapper = (migration: ARKMigrationViewStructOutput): Migration => {
	const amount = Number.parseFloat(ethers.utils.formatEther(migration.amount.toString()));

	const status =
		migration.recipient === ethers.constants.AddressZero
			? MigrationTransactionStatus.Waiting
			: MigrationTransactionStatus.Confirmed;

	return {
		// @TODO: get the address and timestamp
		// Not sure yet how that will work but maybe we can use the profile to get the address
		// and then the transactions or maybe we can save those values in the env storage
		// when adding a new migration
		address: "PeNdInGPeNdInGPeNdInGPeNdInG",
		amount,
		id: migration.arkTxHash,
		migrationAddress: migration.recipient,
		status,
		// @TODO: read above
		timestamp: Date.now() / 1000,
	};
};

interface MigrationContextType {
	migrations?: Migration[];
}

interface Properties {
	children: React.ReactNode;
	defaultConfiguration?: any;
}

const MigrationContext = React.createContext<any>(undefined);

export const MigrationProvider = ({ children }: Properties) => {
	const [repository, setRepository] = useState<MigrationRepository>();
	const { env, persist } = useEnvironmentContext();
	const [migrations, setMigrations] = useState<Migration[]>();
	const [expiredMigrations, setExpiredMigrations] = useState(false);
	const [reloadMigrationsTimeout, setReloadMigrationsTimeout] = useState<ReturnType<typeof setTimeout>>();
	const profile = useProfileWatcher();

	const storeMigrationTransactions = useCallback(async () => {
		repository!.set(migrations!);

		await persist();

		const hasAnyPendingMigration = migrations!.some(
			(migration) => migration.status === MigrationTransactionStatus.Waiting,
		);

		if (hasAnyPendingMigration) {
			const reloadMigrations = () => {
				loadMigrations();
			};

			setReloadMigrationsTimeout(setTimeout(reloadMigrations, 3000));
		}
	}, [migrations, repository]);

	const loadMigrations = useCallback(async () => {
		const migrations = repository!.all();
		const transactionsIds = [
			...migrations.map((tx: Migration) => tx.id),
			// Add some initial transaction ids
			// @TODO: Potentially remove this in favour of storing the transactions
			// when a new migration is added
			...fakeTransactionsIds,
		]
			// Remove duplicated transactions ids
			// @TODO: not needed once we remove the fake ones
			.filter((id, index, original) => original.indexOf(id) === index);
		// @TODO: potential code to replace the one above once the fake
		// transactions are removed
		// const transactionsIds = migrations.map((tx: Migration) => tx.id);

		const provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC_URL);

		const contract = new Contract(CONTRACT_ADDRESS, contractABI, provider);

		const contractMigrations: ARKMigrationViewStructOutput[] = await contract.getMigrationsByArkTxHash(
			transactionsIds,
		);

		const formattedMigrations = contractMigrations.map(transactionMapper);

		setMigrations(formattedMigrations);
	}, [storeMigrationTransactions, repository]);

	useEffect(() => {
		if (migrations === undefined) {
			return;
		}

		storeMigrationTransactions();
	}, [migrations, storeMigrationTransactions]);

	useEffect(() => {
		if (profile) {
			setRepository(new MigrationRepository(profile, env.data()));
		} else {
			setRepository(undefined);
			setMigrations(undefined);
		}

		setExpiredMigrations(true);
	}, [profile]);

	useEffect(() => {
		if (repository === undefined) {
			clearTimeout(reloadMigrationsTimeout);
		}
	}, [repository, reloadMigrationsTimeout]);

	useEffect(() => {
		if (!expiredMigrations) {
			return;
		}

		if (repository === undefined) {
			setMigrations(undefined);
		} else {
			loadMigrations();
		}

		setExpiredMigrations(false);
	}, [expiredMigrations, loadMigrations, repository]);

	return (
		<MigrationContext.Provider value={{ migrations: migrations } as MigrationContextType}>
			{children}
		</MigrationContext.Provider>
	);
};

export const useMigrations = (): {
	migrations: Migration[] | undefined;
} => {
	const value = React.useContext(MigrationContext);

	if (value === undefined) {
		throw new Error("[useMigrations] Component not wrapped within a Provider");
	}

	return value;
};
