import {
	migrationTransactionFee,
	migrationGuideUrl,
	metamaskUrl,
	migrationNetwork,
	migrationWalletAddress,
} from "./polygon-migration";

describe("Polygon Migration Utility Functions", () => {
	it("#migrationTransactionFee", () => {
		expect(migrationTransactionFee()).toBe(0.05);
	});

	it("#migrationGuideUrl", () => {
		expect(migrationGuideUrl()).toBe("https://arkvault.io/docs");
	});

	it("#metamaskUrl", () => {
		expect(metamaskUrl()).toBe("https://metamask.io/");
	});

	it("#migrationNetwork", () => {
		expect(migrationNetwork()).toBe("ark.devnet");
	});

	it("#migrationWalletAddress", () => {
		expect(migrationWalletAddress()).toBe("DNBURNBURNBURNBRNBURNBURNBURKz8StY");
	});
});
