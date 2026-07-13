import { expect, it, describe, beforeEach, afterAll, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { Networks } from "@/app/lib/mainsail";
import { env, getMainsailProfileId, mockNanoSTransport, render, screen, waitFor } from "@/utils/testing-library";
import { LedgerData, useLedgerScanner } from "@/app/contexts/Ledger";
import { MigrationLedgerScanStep } from "./LedgerMigrationScanStep";

const defaultScannerState = {
	abortScanner: vi.fn(),
	canRetry: true,
	error: null,
	isScanning: false,
	isScanningMore: false,
	isSelected: vi.fn().mockReturnValue(false),
	loadedWallets: [],
	scan: vi.fn(),
	selectedWallets: [] as LedgerData[],
	toggleSelect: vi.fn(),
	toggleSelectAll: vi.fn(),
	wallets: [] as LedgerData[],
};

vi.mock("@/app/contexts/Ledger", () => ({
	useLedgerScanner: vi.fn(() => defaultScannerState),
}));

describe("MigrationLedgerScanStep", () => {
	let profile: Contracts.IProfile;
	let network: Networks.Network;

	beforeEach(async () => {
		mockNanoSTransport();
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
		network = profile.wallets().first().network();
		vi.mocked(useLedgerScanner).mockReturnValue(defaultScannerState);
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should not display wallets with zero balance in the table", async () => {
		const migrator = { createTransactions: vi.fn(), flushTransactions: vi.fn() } as any;

		vi.mocked(useLedgerScanner).mockReturnValue({
			...defaultScannerState,
			wallets: [
				{ address: "0xA", balance: "0", path: "m/44'/1'/0'/0/0" },
				{ address: "0xB", balance: "0", path: "m/44'/1'/0'/0/1" },
			],
		});

		render(<MigrationLedgerScanStep migrator={migrator} network={network} profile={profile} />);

		await waitFor(() => {
			expect(screen.queryByTestId("LedgerScanStep__checkbox-row")).not.toBeInTheDocument();
		});
	});

	it("should not display wallets with balance less than dust threshold in the table", async () => {
		const migrator = { createTransactions: vi.fn(), flushTransactions: vi.fn() } as any;

		vi.mocked(useLedgerScanner).mockReturnValue({
			...defaultScannerState,
			wallets: [{ address: "0xA", balance: "0.0005", path: "m/44'/1'/0'/0/0" }],
		});

		render(<MigrationLedgerScanStep migrator={migrator} network={network} profile={profile} />);

		await waitFor(() => {
			expect(screen.queryByTestId("LedgerScanStep__checkbox-row")).not.toBeInTheDocument();
		});
	});

	it("should display wallets with balance above dust threshold and exclude zero/dust balances", async () => {
		const migrator = { createTransactions: vi.fn(), flushTransactions: vi.fn() } as any;

		const dustWallets: LedgerData[] = [
			{ address: "0xA", balance: "0", path: "m/44'/1'/0'/0/0" },
			{ address: "0xB", balance: "0", path: "m/44'/1'/0'/0/1" },
			{ address: "0xC", balance: "0.0005", path: "m/44'/1'/0'/0/2" },
			{ address: "0xD", balance: "0.0008", path: "m/44'/1'/0'/0/3" },
		];

		const validWallets: LedgerData[] = [
			{ address: "0xE", balance: "0.001", path: "m/44'/1'/0'/0/10" },
			{ address: "0xF", balance: "150.5", path: "m/44'/1'/0'/0/11" },
			{ address: "0xG", balance: "0.5", path: "m/44'/1'/0'/0/12" },
		];

		vi.mocked(useLedgerScanner).mockReturnValue({
			...defaultScannerState,
			wallets: [...dustWallets, ...validWallets],
		});

		render(<MigrationLedgerScanStep migrator={migrator} network={network} profile={profile} />);

		await waitFor(() => {
			const rows = screen.getAllByTestId("LedgerScanStep__checkbox-row");
			expect(rows).toHaveLength(2);
		});
	});
});
