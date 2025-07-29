/* eslint-disable sonarjs/no-duplicate-string */
import { describe, expect, it, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { ProfileMainsailMigrator } from "./profile.mainsail-migrator";
import { IProfile, IProfileData } from "./contracts.js";
import { env } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

describe("ProfileMainsailMigrator", () => {
	let migrator: ProfileMainsailMigrator;
	let profile: IProfile;

	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	beforeEach(async () => {
		migrator = new ProfileMainsailMigrator();
		profile = await env.profiles().create("test profile");

		vi.spyOn(profile.walletFactory(), "fromPublicKey").mockImplementation(async ({ publicKey }) => ({
			address: () => `0x${publicKey.slice(0, 10)}`,
		}));
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
		vi.restoreAllMocks();
	});

	describe("migrate", () => {
		it("should return data unchanged when migration is not required", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [{ address: "0x1234567890abcdef", id: "addr-1" }],
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
			expect(result.contacts).toEqual(data.contacts);
			expect(result.wallets).toEqual(data.wallets);
		});

		it("should migrate wallets and contacts when migration is required", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								coin: "ARK",
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

			server.use(
				requestMock(
					"https://ark-live.arkvault.io/api/wallets/AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
					{
						data: {
							publicKey: "03300acecfd7cfc5987ad8cc70bf51c5e93749f76103a02eaf4a1d143729b86a00",
						},
					},
					{ status: 200 },
				),
			);

			const result = await migrator.migrate(profile, data);

			const migratedContact = result.contacts["contact-1"];
			expect(migratedContact.addresses).toHaveLength(1);
			expect(migratedContact.addresses[0]).toEqual({
				address: "0x03300acecf",
				id: "addr-1",
			});
			expect(migratedContact.name).toBe("Test Contact");
			expect(migratedContact.starred).toBe(false);

			const migratedWallet = result.wallets["wallet-1"];
			expect(migratedWallet.data.ADDRESS).toEqual({ ADDRESS: "0x03300acecf" });
		});

		it("should remove contact address when API returns 404", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								coin: "ARK",
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
				wallets: {},
			};

			server.use(
				requestMock(
					"https://ark-live.arkvault.io/api/wallets/AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
					{ error: "Not Found", message: "Wallet not found" },
					{ status: 404 },
				),
			);

			const result = await migrator.migrate(profile, data);

			const migratedContact = result.contacts["contact-1"];
			expect(migratedContact.addresses).toHaveLength(0);
			expect(migratedContact.name).toBe("Test Contact");
			expect(migratedContact.starred).toBe(false);
		});

		it("should throw on non-404 API errors", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								coin: "ARK",
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
				wallets: {},
			};

			server.use(
				requestMock(
					"https://ark-live.arkvault.io/api/wallets/AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
					{ error: "Server Error" },
					{ status: 500 },
				),
			);

			await expect(migrator.migrate(profile, data)).rejects.toThrow(
				"Failed to fetch public key for address AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4: HTTP request failed with status 500",
			);
		});

		it("should remove contact address when API returns no publicKey", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								coin: "ARK",
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
				wallets: {},
			};

			server.use(
				requestMock(
					"https://ark-live.arkvault.io/api/wallets/AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
					{ data: {} },
					{ status: 200 },
				),
			);

			const result = await migrator.migrate(profile, data);

			const migratedContact = result.contacts["contact-1"];
			expect(migratedContact.addresses).toHaveLength(0);
			expect(migratedContact.name).toBe("Test Contact");
			expect(migratedContact.starred).toBe(false);
		});

		it("should handle multiple contacts and addresses", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								coin: "ARK",
								id: "addr-1",
								network: "ark.mainnet",
							},
							{
								address: "DFAWxzGKC3nvqQ5CqRXTqAi8593Jq1gPkt",
								coin: "ARK",
								id: "addr-2",
								network: "ark.devnet",
							},
						],
						id: "contact-1",
						name: "Test Contact 1",
						starred: false,
					},
					"contact-2": {
						addresses: [
							{
								address: "AKt2gsbxtfi84NNqaNzbKGexmUaHnex8XR",
								coin: "ARK",
								id: "addr-3",
								network: "ark.mainnet",
							},
						],
						id: "contact-2",
						name: "Test Contact 2",
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

			server.use(
				requestMock(
					"https://ark-live.arkvault.io/api/wallets/AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
					{
						data: {
							publicKey: "03300acecfd7cfc5987ad8cc70bf51c5e93749f76103a02eaf4a1d143729b86a00",
						},
					},
					{ status: 200 },
				),
				requestMock(
					"https://ark-test.arkvault.io/api/wallets/DFAWxzGKC3nvqQ5CqRXTqAi8593Jq1gPkt",
					{ error: "Not Found", message: "Wallet not found" },
					{ status: 404 },
				),
				requestMock(
					"https://ark-live.arkvault.io/api/wallets/AKt2gsbxtfi84NNqaNzbKGexmUaHnex8XR",
					{
						data: {
							publicKey: "03cd7fcb5e8c3a2f117ea459167a8f2cc986cb54701c333cb347ae42aad1632f49",
						},
					},
					{ status: 200 },
				),
			);

			const result = await migrator.migrate(profile, data);

			const contact1 = result.contacts["contact-1"];
			const contact2 = result.contacts["contact-2"];

			expect(contact1.addresses).toHaveLength(1);
			expect(contact1.addresses[0]).toEqual({
				address: "0x03300acecf",
				id: "addr-1",
			});
			expect(contact1.name).toBe("Test Contact 1");
			expect(contact1.starred).toBe(false);

			expect(contact2.addresses).toHaveLength(1);
			expect(contact2.addresses[0]).toEqual({
				address: "0x03cd7fcb5e",
				id: "addr-3",
			});
			expect(contact2.name).toBe("Test Contact 2");
			expect(contact2.starred).toBe(true);
		});
	});

	describe("requiresMigration", () => {
		it("should return false when no wallets or contacts exist", async () => {
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

		it("should return false when no migration is needed", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [{ address: "0x1234567890abcdef", id: "addr-1" }],
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

		it("should return true when contact network starts with 'ark.'", async () => {
			const data: IProfileData = {
				contacts: {
					"contact-1": {
						addresses: [
							{
								address: "AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
								coin: "ARK",
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
				wallets: {},
			};

			server.use(
				requestMock(
					"https://ark-live.arkvault.io/api/wallets/AdViMQwcwquCP8fbY9eczXzTX7yUs2uMw4",
					{
						data: {
							publicKey: "03300acecfd7cfc5987ad8cc70bf51c5e93749f76103a02eaf4a1d143729b86a00",
						},
					},
					{ status: 200 },
				),
			);

			const result = await migrator.migrate(profile, data);

			const migratedContact = result.contacts["contact-1"];
			expect(migratedContact.addresses[0].address).toMatch(/^0x[a-fA-F0-9]+$/);
		});
	});
});
