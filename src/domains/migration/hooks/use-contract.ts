import { useCallback, useEffect, useState } from "react";
import { ethers, Contract } from "ethers";
import { polygonContractAddress, polygonRpcUrl } from "@/utils/polygon-migration";
import { ARKMigrationViewStructOutput } from "@/domains/migration/migration.contracts";
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

const ONE_MINUTE = 60 * 1000;

const GET_MIGRATIONS_MAX_TRIES = 5;

const GET_MIGRATIONS_TRY_INTERVAL = 1000;

export const useContract = () => {
	const [contract, setContract] = useState<Contract>();
	const [contractIsPaused, setContractIsPaused] = useState<boolean>();

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

	const determineIfContractIsPaused = useCallback(async () => {
		try {
			setContractIsPaused(await contract!.paused());
		} catch {
			//
		}
	}, [contract]);

	useEffect(() => {
		let reloadInerval: ReturnType<typeof setInterval>;

		if (contract === undefined) {
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
	}, [determineIfContractIsPaused, contract, contractIsPaused]);

	useEffect(() => {
		const contractAddress = polygonContractAddress();

		if (contractAddress === undefined) {
			return;
		}

		const provider = new ethers.providers.JsonRpcProvider(polygonRpcUrl());

		setContract(new Contract(contractAddress, contractABI, provider));
	}, []);

	return { contract, contractIsPaused, getContractMigrations };
};
