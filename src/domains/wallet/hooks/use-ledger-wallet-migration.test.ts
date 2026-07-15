import { renderHook, act, waitFor } from "@testing-library/react";

import { Contracts } from "@/app/lib/profiles";
import { ConfigKey } from "@/app/lib/mainsail";
import { WalletData } from "@/app/lib/profiles/wallet.enum";
import { useLedgerMigrationStatus } from "./use-ledger-wallet-migration";
import { env, getMainsailProfileId } from "@/utils/testing-library";

describe("useLedgerMigrationStatus", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
	});

	it("should return false for hasWalletsToMigrate if profile has no wallets", () => {
		const { result } = renderHook(() => useLedgerMigrationStatus(profile));
		expect(result.current.hasWalletsToMigrate).toBe(false);
	});

	it("should return true for hasWalletsToMigrate when a ledger wallet exissts", () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet, "hasDustAmount").mockReturnValue(false);
		vi.spyOn(wallet.data(), "get").mockImplementation((key: string) => {
			if (key === WalletData.DerivationPath) {
				return "m/44'/1'/0'/0/0";
			}
			return;
		});

		const slip44 = profile.activeNetwork().config().get(ConfigKey.Slip44);

		vi.spyOn(profile.activeNetwork().config(), "get").mockImplementation((key: string) => {
			if (key === ConfigKey.Slip44) {
				return slip44;
			}
			return;
		});

		const { result } = renderHook(() => useLedgerMigrationStatus(profile));

		expect(result.current.hasWalletsToMigrate).toBe(true);

		vi.restoreAllMocks();
	});

	it("should return false when wallet has dust amount", () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet, "hasDustAmount").mockReturnValue(true);

		const { result } = renderHook(() => useLedgerMigrationStatus(profile));

		expect(result.current.hasWalletsToMigrate).toBe(false);

		vi.restoreAllMocks();
	});

	it("should return false when coin type does not match slip44", () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet, "hasDustAmount").mockReturnValue(false);
		vi.spyOn(wallet.data(), "get").mockImplementation((key: string) => {
			if (key === WalletData.DerivationPath) {
				return "m/44'/999'/0'/0/0";
			}
			return;
		});

		const { result } = renderHook(() => useLedgerMigrationStatus(profile));

		expect(result.current.hasWalletsToMigrate).toBe(false);

		vi.restoreAllMocks();
	});

	it("should check only selected wallets", () => {
		const selectedWallet = profile.wallets().last();
		vi.spyOn(selectedWallet, "isLedger").mockReturnValue(false);

		const otherWallet = profile.wallets().first();
		vi.spyOn(otherWallet, "isLedger").mockReturnValue(true);
		vi.spyOn(otherWallet, "hasDustAmount").mockReturnValue(false);

		const { result } = renderHook(() => useLedgerMigrationStatus(profile, [selectedWallet]));

		expect(result.current.hasWalletsToMigrate).toBe(false);

		vi.restoreAllMocks();
	});

	it("should return true when there is one matching selected ledger wallet", () => {
		const selectedWallet = profile.wallets().first();
		vi.spyOn(selectedWallet, "isLedger").mockReturnValue(true);
		vi.spyOn(selectedWallet, "hasDustAmount").mockReturnValue(false);
		vi.spyOn(selectedWallet.data(), "get").mockImplementation((key: string) => {
			if (key === WalletData.DerivationPath) {
				return "m/44'/1'/0'/0/0";
			}
			return;
		});

		const slip44 = profile.activeNetwork().config().get(ConfigKey.Slip44);
		vi.spyOn(profile.activeNetwork().config(), "get").mockImplementation((key: string) => {
			if (key === ConfigKey.Slip44) {
				return slip44;
			}
			return;
		});

		const { result } = renderHook(() => useLedgerMigrationStatus(profile, [selectedWallet]));

		expect(result.current.hasWalletsToMigrate).toBe(true);

		vi.restoreAllMocks();
	});

	it("should check all profile wallets when selectedWallets is undefined", () => {
		const { result } = renderHook(() => useLedgerMigrationStatus(profile));

		expect(result.current.hasWalletsToMigrate).toBe(false);
	});

	it("should check all profile wallets when there are multiple selected wallets", () => {
		const wallets = profile.wallets().values().slice(0, 2);
		const { result } = renderHook(() => useLedgerMigrationStatus(profile, wallets));

		expect(result.current.hasWalletsToMigrate).toBe(false);
	});

	it("should load migration status when there are wallets to migrate", async () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet, "hasDustAmount").mockReturnValue(false);
		vi.spyOn(wallet.data(), "get").mockImplementation((key: string) => {
			if (key === WalletData.DerivationPath) {
				return "m/44'/1'/0'/0/0";
			}
			return;
		});

		const slip44 = profile.activeNetwork().config().get(ConfigKey.Slip44);
		vi.spyOn(profile.activeNetwork().config(), "get").mockImplementation((key: string) => {
			if (key === ConfigKey.Slip44) {
				return slip44;
			}
			return;
		});

		const { result } = renderHook(() => useLedgerMigrationStatus(profile));

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.isIgnored).toBe(false);
		expect(result.current.isMigratingLater).toBe(false);

		vi.restoreAllMocks();
	});

	it("should set isIgnored", async () => {
		const { result } = renderHook(() => useLedgerMigrationStatus(profile));

		await act(async () => {
			await result.current.ignore();
		});

		expect(result.current.isIgnored).toBe(true);
	});

	it("should set isMigratingLater", async () => {
		const { result } = renderHook(() => useLedgerMigrationStatus(profile));

		await act(async () => {
			await result.current.migrateLater();
		});

		expect(result.current.isMigratingLater).toBe(true);
	});

	it("should start with isLoading as false when there are no wallets to migrate", () => {
		const { result } = renderHook(() => useLedgerMigrationStatus(profile));

		expect(result.current.isLoading).toBe(false);
	});

	it("should return false when wallet is not a ledger wallet", () => {
		const wallet = profile.wallets().first();
		vi.spyOn(wallet, "isLedger").mockReturnValue(false);
		vi.spyOn(wallet, "hasDustAmount").mockReturnValue(false);

		const { result } = renderHook(() => useLedgerMigrationStatus(profile));

		expect(result.current.hasWalletsToMigrate).toBe(false);

		vi.restoreAllMocks();
	});
});
