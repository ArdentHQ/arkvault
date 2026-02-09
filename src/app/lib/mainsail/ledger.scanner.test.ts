import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mockNanoSTransport } from "@/utils/testing-library";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";

let profile: Contracts.IProfile;

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
			isLegacy: false,
			pageSize: 2,
			slip44,
		});

		expect(result[0].path).toBe(`m/44'/${slip44}'/0'/0/0`);
		expect(result[1].path).toBe(`m/44'/${slip44}'/0'/0/1`);
	});

	it("should scan legacy by incrementing the account index instead of address index", async () => {
		const slip44 = 1;

		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanWithPager({
			isLegacy: true,
			pageSize: 2,
			slip44,
		});

		expect(result[0].path).toBe(`m/44'/${slip44}'/0'/0/0`);
		expect(result[1].path).toBe(`m/44'/${slip44}'/1'/0/0`);
	});

	it("should scan new addresses only", async () => {
		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		const result = await scanner.scanNewAddresses({
			isLegacy: false,
			slip44: 111,
		});

		expect(result).toHaveLength(5);
	});

	it.each([{ isLegacy: false }, { isLegacy: true }])("should scan all that have balance %s", async ({ isLegacy }) => {
		const scanner = profile.ledger().scanner({ scannedWallets: [] });
		vi.spyOn(profile.walletFactory(), "fromAddress").mockResolvedValueOnce(profile.wallets().first());

		const result = await scanner.scanAllWithBalance({
			isLegacy,
			slip44: 111,
		});

		expect(result).toHaveLength(1);
	});

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
});
