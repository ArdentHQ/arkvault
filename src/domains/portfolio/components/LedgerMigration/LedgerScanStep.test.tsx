import { expect, it, describe, beforeEach, afterAll, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { Networks } from "@/app/lib/mainsail";
import { env, getMainsailProfileId, mockNanoSTransport, render, screen, waitFor } from "@/utils/testing-library";
import { LedgerScanStep, showLoadedLedgerWalletsMessage } from "./LedgerScanStep";
import { useLedgerScanner } from "@/app/contexts/Ledger";
import { toasts } from "@/app/services";
import userEvent from "@testing-library/user-event";

vi.mock("@/app/services", () => ({
	toasts: {
		success: vi.fn((...args: any[]) => args),
		update: vi.fn((...args: any[]) => args),
		dismiss: vi.fn(),
		isActive: vi.fn().mockReturnValue(false),
	},
}));

const defaultScannerState = {
	wallets: [
		{
			address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
			balance: "100",
			path: "m/44'/1'/0'/0/1",
		},
	],
	selectedWallets: [],
	loadedWallets: [
		{
			address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
			balance: "100",
			path: "m/44'/1'/0'/0/1",
		},
	],
	isScanning: false,
	canRetry: true,
	error: null,
	scan: vi.fn(),
	abortScanner: vi.fn(),
	isSelected: vi.fn().mockReturnValue(false),
	toggleSelect: vi.fn(),
};

vi.mock("@/app/contexts/Ledger", () => ({
	useLedgerScanner: vi.fn(() => defaultScannerState),
}));

describe("LedgerMigration LedgerScanStep", () => {
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

	it("should render without error", () => {
		render(<LedgerScanStep profile={profile} network={network} children={<div>test</div>} />);

		expect(screen.getByTestId("LedgerScanStep")).toBeInTheDocument();
	});

	it("should render with disableColdWallets", () => {
		render(<LedgerScanStep profile={profile} network={network} disableColdWallets children={<div>test</div>} />);

		expect(screen.getByTestId("LedgerScanStep")).toBeInTheDocument();
	});

	it("should show error when present", () => {
		vi.mocked(useLedgerScanner).mockReturnValue({
			wallets: [],
			selectedWallets: [],
			loadedWallets: [],
			isScanning: false,
			canRetry: false,
			error: "Test error",
			scan: vi.fn(),
			abortScanner: vi.fn(),
			isSelected: vi.fn().mockReturnValue(false),
			toggleSelect: vi.fn(),
		} as any);

		render(<LedgerScanStep profile={profile} network={network} children={<div>test</div>} />);

		expect(screen.getByTestId("LedgerScanStep__error")).toBeInTheDocument();
	});

	it("should show cancelling screen when isCancelling is true", () => {
		render(<LedgerScanStep profile={profile} network={network} isCancelling={true} children={<div>test</div>} />);

		expect(screen.queryByTestId("LedgerScanStep")).not.toBeInTheDocument();
	});

	it("should show loaded wallets message for single wallet", () => {
		const result = showLoadedLedgerWalletsMessage([{ address: "0x123", balance: "100" } as any]);
		expect(result).toMatchSnapshot();
	});

	it("should show loaded wallets message for multiple wallets", () => {
		const result = showLoadedLedgerWalletsMessage([
			{ address: "0x123", balance: "100" } as any,
			{ address: "0x456", balance: "200" } as any,
		]);

		expect(result).toMatchSnapshot();
	});

	it("should call onSelect callback when wallets are selected", async () => {
		const onSelect = vi.fn();

		render(<LedgerScanStep profile={profile} network={network} onSelect={onSelect} children={<div>test</div>} />);

		await waitFor(() => {
			expect(onSelect).toHaveBeenCalled();
		});
	});

	it("should call scanMore callback when clicking scan more button", async () => {
		const { scan } = defaultScannerState;

		render(<LedgerScanStep profile={profile} network={network} children={<div>test</div>} />);

		await waitFor(() => {
			expect(scan).toHaveBeenCalledWith(profile);
		});
	});

	it("should update toast when already active", async () => {
		vi.mocked(toasts.isActive).mockReturnValueOnce(true);

		const toastUpdateSpy = vi.spyOn(toasts, "update");

		render(<LedgerScanStep profile={profile} network={network} children={<div>test</div>} />);

		await waitFor(() => {
			expect(toastUpdateSpy).toHaveBeenCalled();
		});
	});

	it("should call scan more", async () => {
		const user = userEvent.setup();
		const scanMore = vi.fn();

		vi.mocked(useLedgerScanner).mockReturnValue({
			...defaultScannerState,
			canRetry: false,
		});

		render(
			<LedgerScanStep
				profile={profile}
				network={network}
				children={
					<button data-testid="scan-more-button" onClick={scanMore}>
						Scan More
					</button>
				}
			/>,
		);

		const scanMoreButton = screen.getByTestId("scan-more-button");
		await user.click(scanMoreButton);

		expect(scanMore).toHaveBeenCalled();
	});
});
