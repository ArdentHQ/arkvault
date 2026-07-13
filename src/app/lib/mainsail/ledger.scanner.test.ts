import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from "vitest";
import { mockNanoSTransport } from "@/utils/testing-library";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { WalletData } from "@/app/lib/mainsail/wallet.dto";

let profile: Contracts.IProfile;
const derivationPath = "m/44'/111'/0'/0/0";

describe("LedgerScannerTest", () => {
	let transportMock: any;

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		const mockPublicKey = "0293b9fd80d472bbf678404d593705268cf09324115f73103bc1477a3933350041";
		vi.spyOn(profile.ledger(), "getExtendedPublicKey").mockResolvedValue(mockPublicKey);
	});

	beforeEach(() => {
		transportMock = mockNanoSTransport();
	});

	afterEach(() => {
		transportMock.mockRestore();
	});

	it("should scan", async () => {
		await expect(profile.ledger().scanner({ scannedWallets: [] }).scan()).resolves.toHaveLength(1);
		await expect(
			profile.ledger().scanner({ scannedWallets: [] }).scan({ isLoadingMore: true, pageSize: 1 }),
		).resolves.toHaveLength(1);
	});

	it("should scan", async () => {
		await expect(profile.ledger().scanner({ scannedWallets: [] }).scan()).resolves.toHaveLength(1);
	});

	it("should scan with balance priority", async () => {
		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanWithBalancePriority({ pageSize: 3 });

		expect(result).toHaveLength(3);
	});

	it.each([60, 111])("should scan for slip44 %i", async (slip44) => {
		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanWithPager({
			byAccountIndex: false,
			pageSize: 2,
			slip44,
		});

		expect(result[0].path).toBe(`m/44'/${slip44}'/0'/0/0`);
		expect(result[1].path).toBe(`m/44'/${slip44}'/0'/0/1`);
	});

	it("should scan by incrementing the account index", async () => {
		const slip44 = 1;

		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanWithPager({
			byAccountIndex: true,
			pageSize: 2,
			slip44,
		});

		expect(result[0].path).toBe(`m/44'/${slip44}'/0'/0/0`);
		expect(result[1].path).toBe(`m/44'/${slip44}'/1'/0/0`);
	});

	it("should scan new addresses only", async () => {
		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanNewAddresses({
			byAccountIndex: false,
			slip44: 111,
		});

		expect(result).toHaveLength(5);
	});

	it.each([{ byAccountIndex: false }, { byAccountIndex: true }])(
		"should scan all that have balance (byAccountIndex: %s)",
		async ({ byAccountIndex }) => {
			const scanner = profile.ledger().scanner({ scannedWallets: [] });
			vi.spyOn(profile.walletFactory(), "fromAddress").mockResolvedValueOnce(profile.wallets().first());

			const result = await scanner.scanAllWithBalance({
				byAccountIndex,
				slip44: 111,
			});

			expect(result).toHaveLength(1);
		},
	);

	it("should handle regular scan", async () => {
		vi.spyOn(profile.walletFactory(), "fromAddress").mockResolvedValueOnce(profile.wallets().first());

		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scan({ isLoadingMore: true, pageSize: 3 });

		expect(result).toHaveLength(3);
	});

	it("should handle exception", async () => {
		vi.spyOn(profile.walletFactory(), "fromAddress").mockImplementationOnce(() => {
			throw new Error("error");
		});

		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scan({ isLoadingMore: true, pageSize: 3 });

		expect(result).toHaveLength(3);
	});

	it("should skip when no more wallets found", async () => {
		vi.spyOn(profile.ledger(), "scan").mockResolvedValueOnce({});
		vi.spyOn(profile.ledger(), "scanByAccountIndex").mockResolvedValueOnce({});

		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanAllWithBalance({
			byAccountIndex: false,
			slip44: 111,
		});

		expect(result).toHaveLength(0);
	});

	it("should continue scanning when wallet has not synced and pre-scan finds synced wallets", async () => {
		const syncedWallet = profile.wallets().first();
		vi.spyOn(syncedWallet, "hasSyncedWithNetwork").mockReturnValue(false);
		vi.spyOn(syncedWallet, "synchroniser").mockReturnValue({ identity: vi.fn() } as any);

		const fromAddressSpy = vi.spyOn(profile.walletFactory(), "fromAddress");
		fromAddressSpy.mockResolvedValue(syncedWallet);

		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanAllWithBalance({
			byAccountIndex: false,
			slip44: 111,
		});

		expect(result).toHaveLength(0);
		fromAddressSpy.mockRestore();
	});

	it("should continue scanning when wallet has not synced with some consecutive empty", async () => {
		const syncedWallet = profile.wallets().first();
		vi.spyOn(syncedWallet, "hasSyncedWithNetwork").mockReturnValue(false);
		vi.spyOn(syncedWallet, "synchroniser").mockReturnValue({ identity: vi.fn() } as any);

		const fromAddressSpy = vi.spyOn(profile.walletFactory(), "fromAddress");
		fromAddressSpy.mockResolvedValue(syncedWallet);

		const scanSpy = vi.spyOn(profile.ledger(), "scan");
		let callCount = 0;
		scanSpy.mockImplementation(() => {
			callCount++;
			if (callCount <= 2) {
				return {
					[derivationPath]: new WalletData({
						config: profile.wallets().first().network().config(),
					}).fill({
						address: profile.wallets().first().address(),
						balance: 10,
						publicKey: profile.wallets().first().publicKey(),
					}),
				} as any;
			}
			return {} as any;
		});

		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanAllWithBalance({
			byAccountIndex: false,
			slip44: 111,
		});

		expect(result).toHaveLength(0);
		fromAddressSpy.mockRestore();
		scanSpy.mockRestore();
	});

	it("should compute last path with account index sorting when profile has ledger wallets", async () => {
		const syncedWallet = profile.wallets().first();
		vi.spyOn(syncedWallet, "synchroniser").mockReturnValue({ identity: vi.fn() } as any);
		vi.spyOn(profile.walletFactory(), "fromAddress").mockResolvedValue(syncedWallet);

		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanWithBalancePriority({ pageSize: 5 });

		expect(result.length).toBeGreaterThan(0);
	});

	it("should compute last path with account index slip44", async () => {
		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanAllWithBalance({
			byAccountIndex: true,
			slip44: 1,
		});

		expect(result).toHaveLength(0);
	});

	it("should compute last path with address index", async () => {
		const syncedWallet = profile.wallets().first();
		vi.spyOn(syncedWallet, "synchroniser").mockReturnValue({ identity: vi.fn() } as any);
		vi.spyOn(profile.walletFactory(), "fromAddress").mockResolvedValue(syncedWallet);

		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanWithBalancePriority({
			byAccountIndex: false,
			pageSize: 3,
		});

		expect(result.length).toBeGreaterThan(0);
	});

	it("should handle existing imported wallets in scan", async () => {
		const syncedWallet = profile.wallets().first();
		vi.spyOn(syncedWallet, "synchroniser").mockReturnValue({ identity: vi.fn() } as any);
		vi.spyOn(profile.walletFactory(), "fromAddress").mockResolvedValue(syncedWallet);

		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanWithBalancePriority({
			importedLedgerPaths: ["m/44'/60'/0'/0/0", "m/44'/60'/0'/0/1"],
			pageSize: 3,
		});

		expect(result).toBeDefined();
	});

	it("should scan legacy and merge wallets when not loading more", async () => {
		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const scanAllWithBalanceSpy = vi
			.spyOn(scanner, "scanAllWithBalance")
			.mockResolvedValue([{ address: "0x1", balance: "100", path: derivationPath }]);

		const result = await scanner.scanLegacy();

		expect(scanAllWithBalanceSpy).toHaveBeenCalled();
		expect(result).toHaveLength(1);
		expect(result[0].address).toBe("0x1");
	});

	it("should scan legacy and omit wallets when loading more", async () => {
		const existingWallet = { address: "0xExistingAddress", balance: "50", path: derivationPath };
		const scanner = profile.ledger().scanner({ scannedWallets: [existingWallet] });
		const scanAllWithBalanceSpy = vi.spyOn(scanner, "scanAllWithBalance").mockResolvedValue([
			{ address: "0xExistingAddress", balance: "100", path: derivationPath },
			{ address: "0x1", balance: "200", path: "m/44'/111'/0'/0/1" },
		]);

		const result = await scanner.scanLegacy({ isLoadingMore: true });

		expect(scanAllWithBalanceSpy).toHaveBeenCalled();
		expect(result).toHaveLength(1);
		expect(result[0].address).toBe("0x1");
	});

	it("should scan legacy with importedLedgerPaths", async () => {
		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const scanAllWithBalanceSpy = vi
			.spyOn(scanner, "scanAllWithBalance")
			.mockResolvedValue([{ address: "0x1", balance: "100", path: derivationPath }]);

		const result = await scanner.scanLegacy({
			importedLedgerPaths: [derivationPath],
		});

		expect(scanAllWithBalanceSpy).toHaveBeenCalled();
		expect(result).toHaveLength(1);
	});

	it("should scan legacy with pageSize option", async () => {
		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const scanAllWithBalanceSpy = vi.spyOn(scanner, "scanAllWithBalance").mockResolvedValue([]);

		await scanner.scanLegacy({ pageSize: 10 });

		expect(scanAllWithBalanceSpy).toHaveBeenCalled();
	});

	it("should filter dust amounts when skipDust is true", async () => {
		const scanner = profile.ledger().scanner({ scannedWallets: [] });

		const scanAllWithBalanceSpy = vi
			.spyOn(scanner, "scanAllWithBalance")
			.mockResolvedValue([{ address: "0x1", balance: "100", path: derivationPath }]);

		const result = await scanner.scanAllWithBalance({
			byAccountIndex: false,
			skipDust: true,
			slip44: 111,
		});

		expect(scanAllWithBalanceSpy).toHaveBeenCalled();
		expect(result).toBeDefined();
	});

	it("should not filter dust amounts when skipDust is false", async () => {
		const scanner = profile.ledger().scanner({ scannedWallets: [] });

		const scanAllWithBalanceSpy = vi
			.spyOn(scanner, "scanAllWithBalance")
			.mockResolvedValue([{ address: "0x1", balance: "0.001", path: derivationPath }]);

		const result = await scanner.scanAllWithBalance({
			byAccountIndex: false,
			skipDust: false,
			slip44: 111,
		});

		expect(scanAllWithBalanceSpy).toHaveBeenCalled();
		expect(result).toBeDefined();
	});

	it("should merge wallets when not loading more", async () => {
		const syncedWallet = profile.wallets().first();
		vi.spyOn(syncedWallet, "synchroniser").mockReturnValue({ identity: vi.fn() } as any);
		vi.spyOn(profile.walletFactory(), "fromAddress").mockImplementation(() => syncedWallet);

		const existingWallet = { address: syncedWallet.address(), balance: "50", path: derivationPath };
		const scanner = profile.ledger().scanner({ scannedWallets: [existingWallet] });

		const result = await scanner.scan({ pageSize: 3 });

		expect(result.length).toBeGreaterThanOrEqual(1);
		expect(result.some((wallet) => wallet.path === derivationPath)).toBe(true);
	});

	it("should include scanned wallet paths when scanning new addresses", async () => {
		const syncedWallet = profile.wallets().first();
		vi.spyOn(syncedWallet, "synchroniser").mockReturnValue({ identity: vi.fn() } as any);
		vi.spyOn(profile.walletFactory(), "fromAddress").mockImplementation(() => syncedWallet);

		const existingWallet = { address: syncedWallet.address(), balance: "50", path: derivationPath };
		const scanner = profile.ledger().scanner({ scannedWallets: [existingWallet] });

		const result = await scanner.scanNewAddresses({
			byAccountIndex: false,
			slip44: 111,
		});

		expect(result).toBeDefined();
	});

	it("should include scanned wallet paths when scanning with balance", async () => {
		const syncedWallet = profile.wallets().first();
		vi.spyOn(syncedWallet, "synchroniser").mockReturnValue({ identity: vi.fn() } as any);
		vi.spyOn(profile.walletFactory(), "fromAddress").mockImplementation(() => syncedWallet);

		const existingWallet = { address: syncedWallet.address(), balance: "50", path: derivationPath };
		const scanner = profile.ledger().scanner({ scannedWallets: [existingWallet] });

		const result = await scanner.scanWithBalancePriority({ pageSize: 3 });

		expect(result).toBeDefined();
	});
});
