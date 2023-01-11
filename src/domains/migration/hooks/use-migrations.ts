import { useCallback, useEffect, useState } from "react";
import { ethers, Contract } from "ethers";
import {
	ARKMigrationViewStructOutput,
	Migration,
	MigrationTransactionStatus,
} from "@/domains/migration/migration.contracts";
import { useEnvironmentContext } from "@/app/contexts";

/* istanbul ignore next -- @preserve */
const contractAddress = import.meta.env.VITE_POLYGON_CONTRACT_ADDRESS;

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

const ARK_MIGRATIONS_STORAGE_KEY = "ark-migration";

export const useMigrations = () => {
	const { env } = useEnvironmentContext();

	const [migrations, setMigrations] = useState<Migration[]>(env.data().get(ARK_MIGRATIONS_STORAGE_KEY, []) || []);

	// @TODO: make this url and the contract address dynamic depending on the network
	const providerUrl = "https://rpc-mumbai.maticvigil.com/";

	const loadMigrations = useCallback(async () => {
		const transactions = [
			...migrations.map((tx: Migration) => tx.id),
			// Add some initial transaction ids
			// @TODO: Potentially remove this in favour of storing the transactions
			// when a new migration is added
			...fakeTransactionsIds,
		]
			// Remove duplicated transactions ids
			// @TODO: not needed once we remove the fake ones
			.filter((id, index, original) => original.indexOf(id) === index);

		const provider = new ethers.providers.JsonRpcProvider(providerUrl);

		const contract = new Contract(contractAddress, contractABI, provider);

		const contractMigrations: ARKMigrationViewStructOutput[] = await contract.getMigrationsByArkTxHash(
			transactions,
		);

		const formattedMigrations = contractMigrations.map(transactionMapper);

		setMigrations(formattedMigrations);
	}, [migrations]);

	const storeMigrationTransactions = useCallback(async () => {
		env.data().set(ARK_MIGRATIONS_STORAGE_KEY, migrations);

		await env.persist();
	}, [migrations]);

	useEffect(() => {
		storeMigrationTransactions();
	}, [storeMigrationTransactions]);

	useEffect(() => {
		loadMigrations();
	}, []);

	return {
		migrations,
	};
};
