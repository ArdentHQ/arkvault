import React from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import { useMigrationTransactions } from "./use-migration-transactions";
import {
	env,
	getDefaultProfileId,
	WithProviders,
	mockProfileWithPublicAndTestNetworks,
	waitFor,
} from "@/utils/testing-library";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import * as contexts from "@/app/contexts";
import * as polygonMigration from "@/utils/polygon-migration";
import { migrationWalletAddress } from "@/utils/polygon-migration";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let resetProfileNetworksMock: () => void;
let transactionFixture: DTO.ExtendedSignedTransactionData;
let secondTransactionFixture: DTO.ExtendedSignedTransactionData;
let polygonMigrationStartTimeSpy;

describe("useMigrationTransactions hook", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(async () => {
		wallet = profile.wallets().first();
		vi.spyOn(profile.walletFactory(), "fromAddress").mockResolvedValue(wallet);

		polygonMigrationStartTimeSpy = vi.spyOn(polygonMigration, "polygonMigrationStartTime").mockReturnValue(123);

		transactionFixture = new DTO.ExtendedSignedTransactionData(
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

		secondTransactionFixture = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
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

		vi.spyOn(transactionFixture, "memo").mockReturnValue("0xb9EDE6f94D192073D8eaF85f8db677133d483249");
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();

		polygonMigrationStartTimeSpy.mockRestore();
	});

	it("should return loading state if profile is restoring", () => {
		vi.spyOn(contexts, "useConfiguration").mockReturnValue({
			profileIsRestoring: true,
			profileIsSyncing: false,
		});

		vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: [],
			storeTransactions: () => Promise.resolve({}),
		});

		const wrapper = ({ children }: React.PropsWithChildren<{}>) => <WithProviders>{children}</WithProviders>;

		const mockWalletTransactions = vi.spyOn(wallet.transactionIndex(), "received").mockImplementation(() =>
			Promise.resolve({
				currentPage: () => 1,
				hasMorePages: () => false,
				items: () => [transactionFixture, secondTransactionFixture],
			} as any),
		);

		const { result } = renderHook(() => useMigrationTransactions({ profile }), { wrapper });
		expect(result.current.migrations).toHaveLength(0);
		expect(result.current.isLoading).toBe(true);

		mockWalletTransactions.mockRestore();
	});

	it("should return undefined migrations", () => {
		vi.spyOn(contexts, "useConfiguration").mockReturnValue({
			profileIsRestoring: false,
			profileIsSyncing: false,
		});

		vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: [],
			storeTransactions: () => Promise.resolve({}),
		});

		const wrapper = ({ children }: React.PropsWithChildren<{}>) => <WithProviders>{children}</WithProviders>;

		const mockWalletTransactions = vi.spyOn(wallet.transactionIndex(), "received").mockImplementation(() =>
			Promise.resolve({
				currentPage: () => 1,
				hasMorePages: () => false,
				items: () => [],
			} as any),
		);

		const { result } = renderHook(() => useMigrationTransactions({ profile }), { wrapper });
		expect(result.current.migrations).toHaveLength(0);

		mockWalletTransactions.mockRestore();
	});

	it("should store and return migrations", async () => {
		const useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: [
				{
					address: "AdDreSs",
					amount: 123,
					id: "123",
					migrationAddress: "BuRnAdDreSs",
					status: MigrationTransactionStatus.Confirmed,
					timestamp: Date.now() / 1000,
				},
			],
			storeTransactions: () => Promise.resolve({}),
		});
		const wrapper = ({ children }: React.PropsWithChildren<{}>) => <WithProviders>{children}</WithProviders>;

		const mockTransactions = vi.spyOn(wallet.transactionIndex(), "received").mockImplementation(() =>
			Promise.resolve({
				currentPage: () => 1,
				hasMorePages: () => false,
				items: () => [transactionFixture, secondTransactionFixture],
			} as any),
		);

		const { result } = renderHook(() => useMigrationTransactions({ profile }), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.migrations).toHaveLength(1);

		useMigrationsSpy.mockRestore();
		mockTransactions.mockRestore();
	});

	it("should get the transaction for a migration", async () => {
		const migration = {
			address: "AdDreSs",
			amount: 123,
			id: transactionFixture.id(),
			migrationAddress: "BuRnAdDreSs",
			status: MigrationTransactionStatus.Confirmed,
			timestamp: Date.now() / 1000,
		};

		const useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: [migration],
			storeTransactions: () => Promise.resolve({}),
		});

		const wrapper = ({ children }: React.PropsWithChildren<{}>) => <WithProviders>{children}</WithProviders>;

		const mockTransactions = vi.spyOn(wallet.transactionIndex(), "received").mockImplementation(() =>
			Promise.resolve({
				currentPage: () => 1,
				hasMorePages: () => false,
				items: () => [transactionFixture, secondTransactionFixture],
			} as any),
		);

		const { result } = renderHook(() => useMigrationTransactions({ profile }), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.resolveTransaction(migration)).toEqual(transactionFixture);

		useMigrationsSpy.mockRestore();
		mockTransactions.mockRestore();
	});

	it("should do nothing if profile has no wallets on migration network", async () => {
		vi.spyOn(contexts, "useConfiguration").mockReturnValue({
			profileIsRestoring: false,
			profileIsSyncing: false,
		});
		const spyMigrationWallets = vi.spyOn(profile.wallets(), "values").mockReturnValue([]);

		const wrapper = ({ children }: React.PropsWithChildren<{}>) => <WithProviders>{children}</WithProviders>;

		const { result } = renderHook(() => useMigrationTransactions({ profile }), { wrapper });
		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		spyMigrationWallets.mockRestore();
	});

	it("should not include transactions if the recipient is not the migration wallet", async () => {
		const useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: [],
			storeTransaction: () => {},
		});
		const wrapper = ({ children }: React.PropsWithChildren<{}>) => <WithProviders>{children}</WithProviders>;

		vi.spyOn(transactionFixture, "recipient").mockReturnValue("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");
		const mockTransactions = vi.spyOn(wallet.transactionIndex(), "received").mockImplementation(() =>
			Promise.resolve({
				currentPage: () => 1,
				hasMorePages: () => false,
				items: () => [transactionFixture, secondTransactionFixture],
			} as any),
		);

		const { result } = renderHook(() => useMigrationTransactions({ profile }), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.migrations).toHaveLength(0);

		useMigrationsSpy.mockRestore();
		mockTransactions.mockRestore();
	});

	it("should handle load more", async () => {
		const useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: [
				{
					address: "AdDreSs",
					amount: 123,
					id: "123",
					migrationAddress: "BuRnAdDreSs",
					status: MigrationTransactionStatus.Confirmed,
					timestamp: Date.now() / 1000,
				},
			],
			storeTransaction: () => {},
		});
		const wrapper = ({ children }: React.PropsWithChildren<{}>) => <WithProviders>{children}</WithProviders>;

		const mockTransactions = vi.spyOn(wallet.transactionIndex(), "received").mockImplementation(() =>
			Promise.resolve({
				currentPage: () => 1,
				hasMorePages: () => false,
				items: () => [transactionFixture, secondTransactionFixture],
			} as any),
		);

		const { result } = renderHook(() => useMigrationTransactions({ profile }), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.migrations).toHaveLength(1);

		vi.spyOn(transactionFixture, "recipient").mockReturnValue("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");

		useMigrationsSpy.mockRestore();

		vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: [],
			storeTransaction: () => {},
		});

		result.current.onLoadMore();
		expect(result.current.migrations).toHaveLength(0);

		useMigrationsSpy.mockRestore();
		mockTransactions.mockRestore();
	});
});
