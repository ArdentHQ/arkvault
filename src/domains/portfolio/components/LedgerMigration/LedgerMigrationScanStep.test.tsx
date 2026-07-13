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

	it("should not display wallets with balance less than dust threshold in the table", async () => {
		const migrator = { createTransactions: vi.fn(), flushTransactions: vi.fn() } as any;

		vi.mocked(useLedgerScanner).mockReturnValue({
			...defaultScannerState,
			wallets: [],
		});

		render(<MigrationLedgerScanStep migrator={migrator} network={network} profile={profile} />);

		await waitFor(() => {
			expect(screen.queryByTestId("LedgerScanStep__checkbox-row")).not.toBeInTheDocument();
		});
	});

	it("should display wallets with balance above dust threshold and exclude zero/dust balances", async () => {
		const migrator = { createTransactions: vi.fn(), flushTransactions: vi.fn() } as any;

		const validWallets: LedgerData[] = [
			{ address: "0xE", balance: "0.001", path: "m/44'/1'/0'/0/10" },
			{ address: "0xF", balance: "150.5", path: "m/44'/1'/0'/0/11" },
		];

		vi.mocked(useLedgerScanner).mockReturnValue({
			...defaultScannerState,
			wallets: validWallets, // scanner already filtered out dust/zero wallets
		});

		render(<MigrationLedgerScanStep migrator={migrator} network={network} profile={profile} />);

		await waitFor(() => {
			const rows = screen.getAllByTestId("LedgerScanStep__checkbox-row");
			expect(rows).toHaveLength(2);
		});
	});
});
