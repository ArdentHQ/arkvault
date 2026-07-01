import { expect, it, describe, beforeEach, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { Networks } from "@/app/lib/mainsail";
import { env, getMainsailProfileId, mockNanoSTransport, render, screen, waitFor } from "@/utils/testing-library";
import { LedgerTable } from "./LedgerScanStep";
import { LedgerData } from "@/app/contexts/Ledger";
import userEvent from "@testing-library/user-event";

vi.mock("@/app/services", () => ({
	toasts: {
		dismiss: vi.fn(),
		isActive: vi.fn().mockReturnValue(false),
		success: vi.fn(),
		update: vi.fn(),
	},
}));

const defaultScannerState = {
	abortScanner: vi.fn(),
	canRetry: true,
	error: null,
	isScanning: false,
	isScanningMore: false,
	isSelected: vi.fn().mockReturnValue(false),
	loadedWallets: [],
	scan: vi.fn(),
	selectedWallets: [],
	toggleSelect: vi.fn(),
	toggleSelectAll: vi.fn(),
	wallets: [
		{
			address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
			balance: "100",
			path: "m/44'/1'/0'/0/1",
		},
	],
};

const testPath = "m/44'/1'/0'/0/1";

const testWallets: LedgerData[] = [
	{ address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", balance: "100", path: "m/44'/1'/0'/0/0" },
	{ address: "0xAb1234567890abcdef1234567890abcdef123456", balance: "200", path: "m/44'/1'/0'/0/1" },
	{ address: "0xBc234567890abcdef1234567890abcdef1234567", balance: "300", path: "m/44'/1'/1'/0/0" },
	{ address: "0xCd34567890abcdef1234567890abcdef12345678", balance: "400", path: "m/44'/1'/2'/0/0" },
	{ address: "0xDe4567890abcdef1234567890abcdef123456789", balance: "500", path: "m/44'/1'/3'/0/0" },
	{ address: "0xEF567890abcdef1234567890abcdef1234567890", balance: "600", path: "m/44'/1'/4'/0/0" },
	{ address: "0xFa67890abcdef1234567890abcdef12345678901", balance: "700", path: "m/44'/1'/5'/0/0" },
	{ address: "0xab7890abcdef1234567890abcdef123456789012", balance: "800", path: "m/44'/1'/6'/0/0" },
];

const zeroBalanceWallets: LedgerData[] = [
	{
		address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
		balance: 0,
		path: testPath,
	},
];

describe("ImportWallet LedgerTable", () => {
	let profile: Contracts.IProfile;
	let network: Networks.Network;

	beforeEach(async () => {
		mockNanoSTransport();
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
		network = profile.wallets().first().network();
	});

	it("should disable zero-balance wallets when disableColdWallets is true", () => {
		render(
			<LedgerTable
				wallets={zeroBalanceWallets}
				selectedWallets={[]}
				isScanningMore={false}
				isSelected={() => false}
				network={network}
				disableColdWallets
				toggleSelectAll={() => {}}
				toggleSelect={() => {}}
				scanMore={() => {}}
				isScanning={false}
			>
				{() => null}
			</LedgerTable>,
		);

		const checkboxes = screen.getAllByTestId("LedgerScanStep__checkbox-row");
		expect(checkboxes[0]).toBeDisabled();
	});

	it("should enable zero-balance wallets when disableColdWallets is false", () => {
		render(
			<LedgerTable
				wallets={zeroBalanceWallets}
				selectedWallets={[]}
				isScanningMore={false}
				isSelected={() => false}
				network={network}
				toggleSelectAll={() => {}}
				toggleSelect={() => {}}
				scanMore={() => {}}
				isScanning={false}
			>
				{() => null}
			</LedgerTable>,
		);

		const checkboxes = screen.getAllByTestId("LedgerScanStep__checkbox-row");
		expect(checkboxes[0]).not.toBeDisabled();
	});

	it("should show scan-more button in loading state when isScanningMore is true", () => {
		render(
			<LedgerTable
				wallets={defaultScannerState.wallets}
				selectedWallets={[]}
				isScanningMore
				isSelected={() => false}
				network={network}
				toggleSelectAll={() => {}}
				toggleSelect={() => {}}
				scanMore={() => {}}
				isScanning={false}
			>
				{() => null}
			</LedgerTable>,
		);

		expect(screen.getByTestId("LedgerScanStep__scan-more")).toHaveTextContent(/ADD_NEW_ADDRESS|Add New/i);
	});

	it("should render mobile view with skeleton rows when isScanning is true", async () => {
		render(
			<LedgerTable
				wallets={[]}
				selectedWallets={[]}
				isScanningMore={false}
				isSelected={() => false}
				network={network}
				toggleSelectAll={() => {}}
				toggleSelect={() => {}}
				scanMore={() => {}}
				isScanning
			>
				{() => null}
			</LedgerTable>,
		);

		await waitFor(() => {
			const skeletons = screen.getAllByTestId("AddressMobileItem__skeleton");
			expect(skeletons.length).toBeGreaterThan(0);
		});
	});

	it("should show all wallets after clicking load-more button", async () => {
		const user = userEvent.setup();

		render(
			<LedgerTable
				wallets={testWallets}
				selectedWallets={[]}
				isScanningMore={false}
				isSelected={() => false}
				network={network}
				toggleSelectAll={() => {}}
				toggleSelect={() => {}}
				scanMore={() => {}}
				isScanning={false}
			>
				{() => null}
			</LedgerTable>,
		);

		const loadMore = screen.getByTestId("LedgerScanStep__load-more");
		expect(loadMore).toBeInTheDocument();

		await user.click(loadMore);

		await waitFor(() => {
			expect(screen.queryByTestId("LedgerScanStep__load-more")).not.toBeInTheDocument();
		});
	});

	it("should call toggleSelectAll when clicking select-all checkbox", async () => {
		const user = userEvent.setup();
		const toggleSelectAll = vi.fn();

		render(
			<LedgerTable
				wallets={defaultScannerState.wallets}
				selectedWallets={[]}
				isScanningMore={false}
				isSelected={() => false}
				network={network}
				toggleSelectAll={toggleSelectAll}
				toggleSelect={() => {}}
				scanMore={() => {}}
				isScanning={false}
			>
				{() => null}
			</LedgerTable>,
		);

		await user.click(screen.getByTestId("LedgerScanStep__select-all"));

		expect(toggleSelectAll).toHaveBeenCalled();
	});

	it("should show select-all as unchecked when wallets exist but none selected", () => {
		render(
			<LedgerTable
				wallets={defaultScannerState.wallets}
				selectedWallets={[]}
				isScanningMore={false}
				isSelected={() => false}
				network={network}
				toggleSelectAll={() => {}}
				toggleSelect={() => {}}
				scanMore={() => {}}
				isScanning={false}
			>
				{() => null}
			</LedgerTable>,
		);

		const selectAll = screen.getByTestId("LedgerScanStep__select-all");
		expect(selectAll).not.toBeChecked();
	});

	it("should show select-all as unchecked when isScanning is true", () => {
		render(
			<LedgerTable
				wallets={defaultScannerState.wallets}
				selectedWallets={[testPath]}
				isScanningMore={false}
				isSelected={() => true}
				network={network}
				toggleSelectAll={() => {}}
				toggleSelect={() => {}}
				scanMore={() => {}}
				isScanning
			>
				{() => null}
			</LedgerTable>,
		);

		const selectAll = screen.getByTestId("LedgerScanStep__select-all");
		expect(selectAll).not.toBeChecked();
	});

	it("should show select-all as checked when all wallets selected", () => {
		render(
			<LedgerTable
				wallets={defaultScannerState.wallets}
				selectedWallets={[testPath]}
				isScanningMore={false}
				isSelected={() => true}
				network={network}
				toggleSelectAll={() => {}}
				toggleSelect={() => {}}
				scanMore={() => {}}
				isScanning={false}
			>
				{() => null}
			</LedgerTable>,
		);

		const selectAll = screen.getByTestId("LedgerScanStep__select-all");
		expect(selectAll).toBeChecked();
	});

	it("should render skeleton rows in desktop view when isScanning is true", () => {
		render(
			<LedgerTable
				wallets={defaultScannerState.wallets}
				selectedWallets={[]}
				isScanningMore={false}
				isSelected={() => false}
				network={network}
				toggleSelectAll={() => {}}
				toggleSelect={() => {}}
				scanMore={() => {}}
				isScanning
			>
				{() => null}
			</LedgerTable>,
		);

		const rows = screen.getAllByRole("row");
		expect(rows.length).toBeGreaterThan(0);
	});

	it("should call toggleSelect when clicking a wallet row checkbox", async () => {
		const user = userEvent.setup();
		const toggleSelect = vi.fn();

		render(
			<LedgerTable
				wallets={defaultScannerState.wallets}
				selectedWallets={[]}
				isScanningMore={false}
				isSelected={() => false}
				network={network}
				toggleSelectAll={() => {}}
				toggleSelect={toggleSelect}
				scanMore={() => {}}
				isScanning={false}
			>
				{() => null}
			</LedgerTable>,
		);

		await user.click(screen.getByTestId("LedgerScanStep__checkbox-row"));

		expect(toggleSelect).toHaveBeenCalledWith(testPath);
	});
});
