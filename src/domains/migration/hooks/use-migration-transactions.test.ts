import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import { useMigrationTransactions } from "./use-migration-transactions";
import { env, getDefaultProfileId, mockProfileWithPublicAndTestNetworks, waitFor } from "@/utils/testing-library";
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

	it("should not load migration wallet transactions if no profile", () => {
		const mockTransactions = vi.spyOn(wallet.transactionIndex(), "received");

		renderHook(() => useMigrationTransactions({ profile: undefined }));

		expect(mockTransactions).not.toHaveBeenCalled();

		mockTransactions.mockRestore();
	});

	it("should load migration wallet transactions", async () => {
		const mockTransactions = vi.spyOn(wallet.transactionIndex(), "received").mockImplementation(() =>
			Promise.resolve({
				currentPage: () => 1,
				hasMorePages: () => false,
				items: () => [transactionFixture, secondTransactionFixture],
			} as any),
		);

		const { result } = renderHook(() => useMigrationTransactions({ profile }));

		expect(result.current.latestTransactions).toHaveLength(0);

		await waitFor(() => {
			expect(result.current.latestTransactions).toHaveLength(2);
		});

		mockTransactions.mockRestore();
	});

	it("should do nothing if profile has no wallets on migration network", async () => {
		const spyMigrationWallets = vi.spyOn(profile.wallets(), "values").mockReturnValue([]);

		const { result } = renderHook(() => useMigrationTransactions({ profile }));

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.latestTransactions).toHaveLength(0);

		spyMigrationWallets.mockRestore();
	});

	it("removes the transactions for a wallet", async () => {
		const mockTransactions = vi.spyOn(wallet.transactionIndex(), "received").mockImplementation(() =>
			Promise.resolve({
				currentPage: () => 1,
				hasMorePages: () => false,
				items: () => [transactionFixture, secondTransactionFixture],
			} as any),
		);

		const { result } = renderHook(() => useMigrationTransactions({ profile }));

		expect(result.current.latestTransactions).toHaveLength(0);

		await waitFor(() => {
			expect(result.current.latestTransactions).toHaveLength(2);
		});

		result.current.removeTransactions(wallet.address());

		expect(result.current.latestTransactions).toHaveLength(0);

		mockTransactions.mockRestore();
	});
});
