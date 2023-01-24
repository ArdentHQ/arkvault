import {
	migrationTransactionFee,
	migrationGuideUrl,
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
} from "./polygon-migration";

describe("Polygon Migration Utility Functions", () => {
	it("#migrationTransactionFee", () => {
		expect(migrationTransactionFee()).toBe(0.05);
	});

	it("#migrationGuideUrl", () => {
		expect(migrationGuideUrl()).toBe("https://arkvault.io/docs");
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
		process.env.VITE_POLYGON_MIGRATION_START_TIME = undefined;
		expect(polygonMigrationStartTime()).toBe(0);

		process.env.VITE_POLYGON_MIGRATION_START_TIME = "12345";
		expect(polygonMigrationStartTime()).toBe(12345);
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
