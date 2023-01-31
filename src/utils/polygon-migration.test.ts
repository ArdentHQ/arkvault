import { DTO } from "@ardenthq/sdk-profiles";

import {
	migrationTransactionFee,
	migrationGuideUrl,
	migrationLearnMoreUrl,
	migrationMinBalance,
	metamaskUrl,
	migrationNetwork,
	migrationWalletAddress,
	polygonExplorerLink,
	polygonTransactionLink,
	polygonRpcUrl,
	polygonContractAddress,
	polygonNetworkData,
	polygonIndexerUrl,
	polygonMigrationStartTime,
	isValidMigrationTransaction,
} from "./polygon-migration";

import { env, getDefaultProfileId } from "@/utils/testing-library";

describe("Polygon Migration Utility Functions", () => {
	it("#migrationTransactionFee", () => {
		expect(migrationTransactionFee()).toBe(0.05);
	});

	it("#migrationGuideUrl", () => {
		expect(migrationGuideUrl()).toBe("https://ark.dev/docs/core/migration/devnet");
	});

	it("#migrationLearnMoreUrl", () => {
		expect(migrationLearnMoreUrl()).toBe("https://arkscic.com/blog/ark-is-moving-to-polygon");
	});

	it("#migrationMinBalance", () => {
		expect(migrationMinBalance()).toBe(1);
	});

	it("#metamaskUrl", () => {
		expect(metamaskUrl()).toBe("https://metamask.io/");
	});

	it("#migrationNetwork", () => {
		expect(migrationNetwork()).toBe("ark.devnet");
	});

	it("#polygonExplorerLink", () => {
		process.env.VITE_POLYGON_EXPLORER_URL = "https://mumbai.polygonscan.com";
		expect(polygonExplorerLink()).toBe("https://mumbai.polygonscan.com");
	});

	it("#polygonContractAddress", () => {
		process.env.VITE_POLYGON_CONTRACT_ADDRESS = "0x000000000";
		expect(polygonContractAddress()).toBe("0x000000000");
	});

	it("#polygonTransactionLink", () => {
		process.env.VITE_POLYGON_EXPLORER_URL = "https://mumbai.polygonscan.com";
		expect(polygonTransactionLink("0xcx22")).toBe("https://mumbai.polygonscan.com/tx/0xcx22");
	});

	it("#polygonRpcUrl", () => {
		process.env.VITE_POLYGON_RPC_URL = "https://rpc-mumbai.maticvigil.com/";
		expect(polygonRpcUrl()).toBe("https://rpc-mumbai.maticvigil.com/");
	});

	it("#polygonIndexerUrl", () => {
		process.env.VITE_POLYGON_INDEXER_URL = "indexer-url";
		expect(polygonIndexerUrl()).toBe("indexer-url");
	});

	it("#polygonMigrationStartTime", () => {
		delete process.env.VITE_POLYGON_MIGRATION_START_TIME;

		expect(polygonMigrationStartTime()).toBe(0);

		process.env.VITE_POLYGON_MIGRATION_START_TIME = "12345";

		expect(polygonMigrationStartTime()).toBe(12_345);
	});

	it("#migrationWalletAddress", () => {
		expect(migrationWalletAddress()).toBe("DNBURNBURNBURNBRNBURNBURNBURKz8StY");
	});

	it("#polygonNetworkData", () => {
		expect(polygonNetworkData()).toEqual({
			blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
			chainId: "0x13881",
			chainName: "Mumbai",
			nativeCurrency: {
				decimals: 18,
				name: "MATIC",
				symbol: "MATIC",
			},
			rpcUrls: ["https://matic-mumbai.chainstacklabs.com/"],
		});
	});

	it("#polygonNetworkData mainnet", () => {
		process.env.VITE_MIGRATION_NETWORK = "ark.mainnet";

		expect(polygonNetworkData()).toEqual({
			blockExplorerUrls: ["https://polygonscan.com/"],
			chainId: "0x89",
			chainName: "Polygon Mainnet",
			nativeCurrency: {
				decimals: 18,
				name: "MATIC",
				symbol: "MATIC",
			},
			rpcUrls: ["https://polygon-rpc.com/"],
		});
	});
});

describe("Polygon Migration Transaction Validation", () => {
	let transaction: DTO.ExtendedSignedTransactionData;

	beforeAll(async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const wallet = profile.wallets().first();

		transaction = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: migrationWalletAddress(),
					},
					fee: 1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);
	});

	it("should return false if memo is undefined", () => {
		vi.spyOn(transaction, "memo").mockReturnValue(undefined);
		expect(isValidMigrationTransaction(transaction)).toBe(false);
	});

	it("should return false if memo is invalid polygon address", () => {
		vi.spyOn(transaction, "memo").mockReturnValue("0xb9EDE6f94D192073D8eaF85f8db6249");
		expect(isValidMigrationTransaction(transaction)).toBe(false);
	});

	it("should return true if recipient is the migration wallet", () => {
		vi.spyOn(transaction, "recipient").mockReturnValue(migrationWalletAddress());
		vi.spyOn(transaction, "memo").mockReturnValue("0xb9EDE6f94D192073D8eaF85f8db677133d483249");
		expect(isValidMigrationTransaction(transaction)).toBe(true);
	});

	it("should return false if recipient is not the migration wallet", () => {
		vi.spyOn(transaction, "recipient").mockReturnValue("DBk4cPYpqp7EBcvkstVDpyX7RQJNHxpMg8");
		vi.spyOn(transaction, "memo").mockReturnValue("0xb9EDE6f94D192073D8eaF85f8db677133d483249");
		expect(isValidMigrationTransaction(transaction)).toBe(false);
	});

	it("should return false if transaction amount is less than the min allowed threshold", () => {
		vi.spyOn(transaction, "recipient").mockReturnValue(migrationWalletAddress());
		vi.spyOn(transaction, "memo").mockReturnValue("0xb9EDE6f94D192073D8eaF85f8db677133d483249");
		vi.spyOn(transaction, "amount").mockReturnValue(0.01);
		expect(isValidMigrationTransaction(transaction)).toBe(false);

		vi.restoreAllMocks();
	});

	it("should return false if transaction fee is less than the min allowed threshold", () => {
		vi.spyOn(transaction, "recipient").mockReturnValue(migrationWalletAddress());
		vi.spyOn(transaction, "memo").mockReturnValue("0xb9EDE6f94D192073D8eaF85f8db677133d483249");
		vi.spyOn(transaction, "fee").mockReturnValue(0.01);
		expect(isValidMigrationTransaction(transaction)).toBe(false);
	});
});
