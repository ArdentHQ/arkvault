import {
	migrationTransactionFee,
	migrationGuideUrl,
	metamaskUrl,
	migrationNetwork,
	migrationWalletAddress,
} from "./polygon-migration";

describe("Url validation", () => {
	it("#migrationTransactionFee", async () => {
		expect(migrationTransactionFee()).toBe(0.05);
	});

	it("migrationGuideUrl", async () => {
		expect(migrationGuideUrl()).toBe("https://arkvault.io/docs");
	});

	it("metamaskUrl", async () => {
		expect(metamaskUrl()).toBe("https://metamask.io/");
	});

	it("migrationNetwork", async () => {
		expect(migrationNetwork()).toBe("ark.mainnet");
	});

	it("migrationWalletAddress", async () => {
		expect(migrationWalletAddress()).toBe("DNBURNBURNBURNBRNBURNBURNBURKz8StY");
	});
});
