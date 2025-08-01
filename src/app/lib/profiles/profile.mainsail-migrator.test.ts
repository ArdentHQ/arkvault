/* eslint-disable sonarjs/no-duplicate-string */
import { describe, expect, it, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { ProfileMainsailMigrator } from "./profile.mainsail-migrator";
import { IProfile, IProfileData } from "./contracts.js";
import { env } from "@/utils/testing-library";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";

describe("ProfileMainsailMigrator", () => {
	let migrator: ProfileMainsailMigrator;
	let profile: IProfile;

	beforeAll(() => {
		server.listen();
	});

	afterEach(() => {
		server.resetHandlers();
		env.profiles().forget(profile.id());
		vi.restoreAllMocks();
	});

	afterAll(() => {
		server.close();
	});

	beforeEach(async () => {
		server.use(
			http.get("https://ark-live.arkvault.io/api/wallets/:address", ({ params }) => {
				const address = params.address as string;

				if (address === "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4") {
					return HttpResponse.json({
						data: {
							publicKey: "03300acecfd7cfc5987ad8cc70bf51c5e93749f76103a02eaf4a1d143729b86a00",
						},
					});
				}

				if (address === "DFAWxzGKC3nvqQ5CqRXTqAi8593Jq1gPkt") {
					return HttpResponse.json({
						data: {
							publicKey: "03a124a54dd6d0e16035f52656200f71818f349ebfcfb8de571a6a3f4167f55cc4",
						},
					});
				}

				return new HttpResponse(null, { status: 404 });
			}),
			http.get("https://ark-test.arkvault.io/api/wallets/:address", ({ params }) => {
				const address = params.address as string;

				if (address === "DFAWxzGKC3nvqQ5CqRXTqAi8593Jq1gPkt") {
					return HttpResponse.json({
						data: {
							publicKey: "03a124a54dd6d0e16035f52656200f71818f349ebfcfb8de571a6a3f4167f55cc4",
						},
					});
				}

				return new HttpResponse(null, { status: 404 });
			}),
		);

		migrator = new ProfileMainsailMigrator();
		profile = await env.profiles().create("test profile");
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

			expect(result.wallets["wallet-1"].data.ADDRESS).toEqual("0xA471E0a5a70211c7929f7d0b2079C424642E2924");
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

			expect(result.wallets["wallet-1"].data.ADDRESS).toEqual("0xA471E0a5a70211c7929f7d0b2079C424642E2924");
			expect(result.wallets["wallet-2"].data.ADDRESS).toEqual("0xaba5cA9A2b6f6EcB5368EAc9aEF2833C1fB4d428");
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
			expect(migratedWallet.data.ADDRESS).toEqual("0xA471E0a5a70211c7929f7d0b2079C424642E2924");
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

			expect(result.wallets["wallet-1"].data.ADDRESS).toEqual("0xA471E0a5a70211c7929f7d0b2079C424642E2924");
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

			expect(result.wallets["wallet-1"].data.ADDRESS).toEqual("0xaba5cA9A2b6f6EcB5368EAc9aEF2833C1fB4d428");
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

			expect(result.wallets["wallet-1"].data.ADDRESS).toEqual("0xA471E0a5a70211c7929f7d0b2079C424642E2924");
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
			expect(migratedWallet.data.ADDRESS).toEqual("0xA471E0a5a70211c7929f7d0b2079C424642E2924");
		});
	});

	describe("contact migration", () => {
		it("should migrate contact addresses successfully", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								id: "addr-1",
								network: "ark.mainnet",
							},
						],
						id: "contact-1",
						name: "Alfonso",
						starred: false,
					},
				},
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

			// The address should be migrated to a new format (starts with 0x)
			expect(result.contacts["contact-1"].addresses[0].address).toMatch(/^0x[a-fA-F0-9]{40}$/);
			expect(result.contacts["contact-1"].name).toBe("Alfonso");
		});

		it("should handle duplicate contact names by adding numbers", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								id: "addr-1",
								network: "ark.mainnet",
							},
						],
						id: "contact-1",
						name: "Alfonso",
						starred: false,
					},
					"contact-2": {
						addresses: [
							{
								address: "DFAWxzGKC3nvqQ5CqRXTqAi8593Jq1gPkt",
								id: "addr-2",
								network: "ark.devnet",
							},
						],
						id: "contact-2",
						name: "Alfonso",
						starred: true,
					},
				},
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

			expect(result.contacts["contact-1"].name).toBe("Alfonso");
			expect(result.contacts["contact-2"].name).toBe("Alfonso (2)");
		});

		it("should remove contacts that have no addresses after migration", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								id: "addr-1",
								network: "ark.mainnet",
							},
						],
						id: "contact-1",
						name: "Valid Contact",
						starred: false,
					},
					"contact-2": {
						addresses: [
							{
								address: "invalid-address",
								id: "addr-2",
								network: "ark.mainnet",
							},
						],
						id: "contact-2",
						name: "Invalid Contact",
						starred: true,
					},
				},
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

			expect(result.contacts["contact-1"]).toBeDefined();
			expect(result.contacts["contact-2"]).toBeUndefined();
			expect(Object.keys(result.contacts)).toHaveLength(1);
		});

		it("should preserve contact properties during migration", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								id: "addr-1",
								network: "ark.mainnet",
							},
						],
						id: "contact-1",
						name: "Test Contact",
						starred: true,
					},
				},
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

			const migratedContact = result.contacts["contact-1"];
			expect(migratedContact.id).toBe("contact-1");
			expect(migratedContact.name).toBe("Test Contact");
			expect(migratedContact.starred).toBe(true);
			expect(migratedContact.addresses).toHaveLength(1);
			expect(migratedContact.addresses[0].id).toBe("addr-1");
		});

		it("should reuse original UUID for first contact and generate deterministic UUIDs for additional contacts", async () => {
			const originalId = "903b2b66-059e-4f03-92e3-f9c685f388b0";
			const data: IProfileData = {
				contacts: {
					[originalId]: {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								id: "addr-1",
								network: "ark.mainnet",
							},
							{
								address: "DFAWxzGKC3nvqQ5CqRXTqAi8593Jq1gPkt",
								id: "addr-2",
								network: "ark.devnet",
							},
						],
						id: originalId,
						name: "Contact1",
						starred: false,
					},
				},
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

			// First contact should reuse original UUID
			expect(result.contacts[originalId]).toBeDefined();
			expect(result.contacts[originalId].id).toBe(originalId);
			expect(result.contacts[originalId].name).toBe("Contact1");

			// Second contact should have deterministic UUID
			const secondContactId = "903b2b66-059e-4f03-92e3-f9c685f388b1";
			expect(result.contacts[secondContactId]).toBeDefined();
			expect(result.contacts[secondContactId].id).toBe(secondContactId);
			expect(result.contacts[secondContactId].name).toBe("Contact1 (2)");

			// Should have exactly 2 contacts
			expect(Object.keys(result.contacts)).toHaveLength(2);
		});

		it("should generate consistent deterministic UUIDs for multiple additional contacts", async () => {
			const originalId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
			const data: IProfileData = {
				contacts: {
					[originalId]: {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								id: "addr-1",
								network: "ark.mainnet",
							},
							{
								address: "DFAWxzGKC3nvqQ5CqRXTqAi8593Jq1gPkt",
								id: "addr-2",
								network: "ark.devnet",
							},
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								id: "addr-3",
								network: "ark.mainnet",
							},
						],
						id: originalId,
						name: "MultiAddress Contact",
						starred: true,
					},
				},
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

			// First contact should reuse original UUID
			expect(result.contacts[originalId]).toBeDefined();
			expect(result.contacts[originalId].id).toBe(originalId);
			expect(result.contacts[originalId].name).toBe("MultiAddress Contact");

			// Second contact should have deterministic UUID
			const secondContactId = "a1b2c3d4-e5f6-7890-abcd-ef1234567891";
			expect(result.contacts[secondContactId]).toBeDefined();
			expect(result.contacts[secondContactId].id).toBe(secondContactId);
			expect(result.contacts[secondContactId].name).toBe("MultiAddress Contact (2)");

			// Third contact should have deterministic UUID
			const thirdContactId = "a1b2c3d4-e5f6-7890-abcd-ef1234567892";
			expect(result.contacts[thirdContactId]).toBeDefined();
			expect(result.contacts[thirdContactId].id).toBe(thirdContactId);
			expect(result.contacts[thirdContactId].name).toBe("MultiAddress Contact (3)");

			// Should have exactly 3 contacts
			expect(Object.keys(result.contacts)).toHaveLength(3);
		});

		it("should ensure contact id property matches dictionary key", async () => {
			const originalId = "test-uuid-1234-5678-9abc-def012345678";
			const data: IProfileData = {
				contacts: {
					[originalId]: {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								id: "addr-1",
								network: "ark.mainnet",
							},
						],
						id: originalId,
						name: "Test Contact",
						starred: false,
					},
				},
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

			const migratedContact = result.contacts[originalId];
			expect(migratedContact).toBeDefined();
			expect(migratedContact.id).toBe(originalId);
			expect(migratedContact.id).toBe(Object.keys(result.contacts)[0]);
		});

		it("should skip contact addresses with non-ark networks", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "0x1234567890abcdef",
								id: "addr-1",
								network: "mainsail.devnet", // Non-ark network
							},
						],
						id: "contact-1",
						name: "Test Contact",
						starred: false,
					},
				},
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
							NETWORK: "ark.mainnet", // This triggers migration
							PUBLIC_KEY: "03300acecfd7cfc5987ad8cc70bf51c5e93749f76103a02eaf4a1d143729b86a00",
						},
						id: "wallet-1",
						settings: {},
					},
				},
			};

			const result = await migrator.migrate(profile, data);

			// Contact should be removed because no addresses remain after migration
			expect(result.contacts["contact-1"]).toBeUndefined();
			expect(Object.keys(result.contacts)).toHaveLength(0);
		});

		it("should handle contact address migration when API returns non-200 status", async () => {
			server.use(
				http.get(
					"https://ark-live.arkvault.io/api/wallets/:address",
					() => new HttpResponse(null, { status: 404 }),
				),
			);

			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								id: "addr-1",
								network: "ark.mainnet",
							},
						],
						id: "contact-1",
						name: "Test Contact",
						starred: false,
					},
				},
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

			// Contact should be removed because address migration failed due to non-200 status
			expect(result.contacts["contact-1"]).toBeUndefined();
			expect(Object.keys(result.contacts)).toHaveLength(0);
		});

		it("should handle contact address migration when API response has no publicKey", async () => {
			server.use(
				http.get("https://ark-live.arkvault.io/api/wallets/:address", () =>
					HttpResponse.json({
						data: {
							// No publicKey in response
						},
					}),
				),
			);

			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								id: "addr-1",
								network: "ark.mainnet",
							},
						],
						id: "contact-1",
						name: "Test Contact",
						starred: false,
					},
				},
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

			// Contact should be removed because address migration failed due to no publicKey
			expect(result.contacts["contact-1"]).toBeUndefined();
			expect(Object.keys(result.contacts)).toHaveLength(0);
		});

		it("should migrate avatar when it is not a data URL", async () => {
			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {
					AVATAR: "not-a-data-url",
					LOCALE: "en-US",
					NAME: "Test User",
					THEME: "dark",
				},
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

			// Avatar should be migrated to a generated one since it's not a data URL
			expect(result.settings.AVATAR).toBeDefined();
			expect(result.settings.AVATAR).not.toBe("not-a-data-url");
			expect(result.settings.AVATAR).toContain("<svg");
		});

		it("should preserve avatar when it is a data URL", async () => {
			const originalAvatar = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PC9zdmc+";
			const data: IProfileData = {
				contacts: {},
				data: {},
				exchangeTransactions: {},
				hosts: {},
				id: "test-profile",
				networks: {},
				notifications: {},
				settings: {
					AVATAR: originalAvatar,
					LOCALE: "en-US",
					NAME: "Test User",
					THEME: "dark",
				},
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

			// Avatar should be preserved since it's a data URL
			expect(result.settings.AVATAR).toBe(originalAvatar);
		});

		it("should throw error when contact address migration fails with non-404 error", async () => {
			server.use(
				http.get("https://ark-live.arkvault.io/api/wallets/:address", () => {
					throw new Error("Network error 500");
				}),
			);

			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								id: "addr-1",
								network: "ark.mainnet",
							},
						],
						id: "contact-1",
						name: "Test Contact",
						starred: false,
					},
				},
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

			await expect(migrator.migrate(profile, data)).rejects.toThrow(
				"Failed to fetch public key for address AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4: HTTP request failed with status 500",
			);
		});
	});
});
