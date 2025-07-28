/* eslint-disable sonarjs/no-duplicate-string */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ProfileMainsailMigrator } from "./profile.mainsail-migrator";
import { IProfile, IProfileData } from "./contracts.js";
import { env } from "@/utils/testing-library";

describe("ProfileMainsailMigrator", () => {
	let migrator: ProfileMainsailMigrator;
	let profile: IProfile;

	beforeEach(async () => {
		migrator = new ProfileMainsailMigrator();
		profile = await env.profiles().create("test profile");
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
		vi.restoreAllMocks();
	});

	describe("migrate", () => {
		it("should return data unchanged when migration is not required", async () => {
			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {},
				wallets: {
					"wallet-1": {
						data: {
							ADDRESS: "0x1234567890abcdef",
							NETWORK: "mainsail.devnet",
							PUBLIC_KEY: "03abcdef1234567890",
						},
						id: "wallet-1",
						settings: {},
					},
				},
			};

			const result = await migrator.migrate(profile, data);

			expect(result).toBe(data);
			expect(result.wallets).toEqual(data.wallets);
		});

		it("should migrate wallets when migration is required", async () => {
			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {},
				wallets: {
					"wallet-1": {
						data: {
							ADDRESS: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
							NETWORK: "ark.mainnet",
							PUBLIC_KEY: "03300acecfd7cfc5987ad8cc70bf51c5e93749f76103a02eaf4a1d143729b86a00",
						},
						id: "wallet-1",
						settings: {},
					},
				},
			};

			const result = await migrator.migrate(profile, data);

			expect(result.wallets["wallet-1"].data.ADDRESS).toEqual({ ADDRESS: expect.any(String) });
			expect(result.wallets["wallet-1"].data.ADDRESS.ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it("should handle multiple wallets migration", async () => {
			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {},
				wallets: {
					"wallet-1": {
						data: {
							ADDRESS: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
							NETWORK: "ark.mainnet",
							PUBLIC_KEY: "03300acecfd7cfc5987ad8cc70bf51c5e93749f76103a02eaf4a1d143729b86a00",
						},
						id: "wallet-1",
						settings: {},
					},
					"wallet-2": {
						data: {
							ADDRESS: "DFAWxzGKC3nvqQ5CqRXTqAi8593Jq1gPkt",
							NETWORK: "ark.devnet",
							PUBLIC_KEY: "03a124a54dd6d0e16035f52656200f71818f349ebfcfb8de571a6a3f4167f55cc4",
						},
						id: "wallet-2",
						settings: {},
					},
				},
			};

			const result = await migrator.migrate(profile, data);

			expect(result.wallets["wallet-1"].data.ADDRESS).toEqual({ ADDRESS: expect.any(String) });
			expect(result.wallets["wallet-2"].data.ADDRESS).toEqual({ ADDRESS: expect.any(String) });
			expect(result.wallets["wallet-1"].data.ADDRESS.ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
			expect(result.wallets["wallet-2"].data.ADDRESS.ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it("should preserve other wallet data during migration", async () => {
			const originalWalletData = {
				ADDRESS: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
				BALANCE: {
					available: "1000000000",
					fees: "1000000000",
				},
				NETWORK: "ark.mainnet",
				PUBLIC_KEY: "03300acecfd7cfc5987ad8cc70bf51c5e93749f76103a02eaf4a1d143729b86a00",
				STARRED: true,
				STATUS: "COLD",
				VOTES: [],
			};

			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {},
				wallets: {
					"wallet-1": {
						data: originalWalletData,
						id: "wallet-1",
						settings: {
							ALIAS: "Test Wallet",
							AVATAR: "test-avatar",
						},
					},
				},
			};

			const result = await migrator.migrate(profile, data);

			const migratedWallet = result.wallets["wallet-1"];
			expect(migratedWallet.data.ADDRESS).toEqual({ ADDRESS: expect.any(String) });
			expect(migratedWallet.data.PUBLIC_KEY).toBe(originalWalletData.PUBLIC_KEY);
			expect(migratedWallet.data.BALANCE).toEqual(originalWalletData.BALANCE);
			expect(migratedWallet.data.VOTES).toEqual(originalWalletData.VOTES);
			expect(migratedWallet.data.STARRED).toBe(originalWalletData.STARRED);
			expect(migratedWallet.data.STATUS).toBe(originalWalletData.STATUS);
			expect(migratedWallet.settings).toEqual(data.wallets["wallet-1"].settings);
		});
	});

	describe("requiresMigration", () => {
		it("should return false when no wallets exist", async () => {
			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {},
				wallets: {},
			};

			const result = await migrator.migrate(profile, data);

			expect(result).toBe(data);
		});

		it("should return false when first wallet network does not start with 'ark.'", async () => {
			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {},
				wallets: {
					"wallet-1": {
						data: {
							ADDRESS: "0x1234567890abcdef",
							NETWORK: "mainsail.devnet",
							PUBLIC_KEY: "03abcdef1234567890",
						},
						id: "wallet-1",
						settings: {},
					},
				},
			};

			const result = await migrator.migrate(profile, data);

			expect(result).toBe(data);
		});

		it("should return true when first wallet network starts with 'ark.'", async () => {
			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {},
				wallets: {
					"wallet-1": {
						data: {
							ADDRESS: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
							NETWORK: "ark.mainnet",
							PUBLIC_KEY: "03300acecfd7cfc5987ad8cc70bf51c5e93749f76103a02eaf4a1d143729b86a00",
						},
						id: "wallet-1",
						settings: {},
					},
				},
			};

			const result = await migrator.migrate(profile, data);

			expect(result.wallets["wallet-1"].data.ADDRESS).toEqual({ ADDRESS: expect.any(String) });
			expect(result.wallets["wallet-1"].data.ADDRESS.ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it("should return true for ark.devnet network", async () => {
			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {},
				wallets: {
					"wallet-1": {
						data: {
							ADDRESS: "DFAWxzGKC3nvqQ5CqRXTqAi8593Jq1gPkt",
							NETWORK: "ark.devnet",
							PUBLIC_KEY: "03a124a54dd6d0e16035f52656200f71818f349ebfcfb8de571a6a3f4167f55cc4",
						},
						id: "wallet-1",
						settings: {},
					},
				},
			};

			const result = await migrator.migrate(profile, data);

			expect(result.wallets["wallet-1"].data.ADDRESS).toEqual({ ADDRESS: expect.any(String) });
			expect(result.wallets["wallet-1"].data.ADDRESS.ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});
	});

	describe("wallet address migration", () => {
		it("should migrate wallet address using public key", async () => {
			const walletData = {
				ADDRESS: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
				NETWORK: "ark.mainnet",
				PUBLIC_KEY: "03300acecfd7cfc5987ad8cc70bf51c5e93749f76103a02eaf4a1d143729b86a00",
			};

			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {},
				wallets: {
					"wallet-1": {
						data: walletData,
						id: "wallet-1",
						settings: {},
					},
				},
			};

			const result = await migrator.migrate(profile, data);

			expect(result.wallets["wallet-1"].data.ADDRESS).toEqual({ ADDRESS: expect.any(String) });
			expect(result.wallets["wallet-1"].data.ADDRESS.ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});

		it("should preserve wallet ID and settings during migration", async () => {
			const originalSettings = {
				ALIAS: "Test Wallet",
				AVATAR: "<svg>test</svg>",
				IS_SELECTED: true,
			};

			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {},
				wallets: {
					"wallet-1": {
						data: {
							ADDRESS: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
							NETWORK: "ark.mainnet",
							PUBLIC_KEY: "03300acecfd7cfc5987ad8cc70bf51c5e93749f76103a02eaf4a1d143729b86a00",
						},
						id: "wallet-1",
						settings: originalSettings,
					},
				},
			};

			const result = await migrator.migrate(profile, data);

			const migratedWallet = result.wallets["wallet-1"];
			expect(migratedWallet.id).toBe("wallet-1");
			expect(migratedWallet.settings).toEqual(originalSettings);
			expect(migratedWallet.data.ADDRESS).toEqual({ ADDRESS: expect.any(String) });
		});
	});
});
