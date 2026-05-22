import { describe, expect, it, vi, beforeEach, afterAll } from "vitest";
import React from "react";
import { FormProvider } from "react-hook-form";
import userEvent from "@testing-library/user-event";
import { Contracts } from "@/app/lib/profiles";
import { Networks } from "@/app/lib/mainsail";
import { env, getMainsailProfileId, mockNanoSTransport, render, screen, waitFor } from "@/utils/testing-library";
import { LedgerScanStep, showLoadedLedgerWalletsMessage } from "./LedgerScanStep";
import { useLedgerScanner } from "@/app/contexts/Ledger";
import { toasts } from "@/app/services";

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
	loadedWallets: [
		{
			address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
			balance: "100",
			path: "m/44'/1'/0'/0/1",
		},
	],
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

vi.mock("@/app/contexts/Ledger", () => ({
	useLedgerScanner: vi.fn(() => defaultScannerState),
}));

describe("ImportWallet LedgerScanStep component", () => {
	let profile: Contracts.IProfile;
	let network: Networks.Network;

	beforeEach(async () => {
		mockNanoSTransport();
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
		network = profile.wallets().first().network();
		vi.mocked(useLedgerScanner).mockReturnValue(defaultScannerState);
		vi.mocked(toasts.isActive).mockReturnValue(false);
		vi.mocked(toasts.success).mockClear();
		vi.mocked(toasts.update).mockClear();
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	const Component = ({
		cancelling = false,
		setRetryFn,
	}: {
		cancelling?: boolean;
		setRetryFn?: (fn?: () => void) => void;
	}) => (
		<FormProvider {...({ register: vi.fn(), setValue: vi.fn(), unregister: vi.fn() } as any)}>
			<LedgerScanStep profile={profile} network={network} cancelling={cancelling} setRetryFn={setRetryFn} />
		</FormProvider>
	);

	it("should show loaded wallets message for single wallet", () => {
		const result = showLoadedLedgerWalletsMessage([{ address: "0x123", balance: "100" } as any]);
		expect(result).toMatchSnapshot();
	});

	it("should render LedgerCancelling when cancelling is true", () => {
		render(<Component cancelling />);

		expect(screen.getByTestId("LedgerCancellingScreen")).toBeInTheDocument();
		expect(screen.queryByTestId("LedgerScanStep")).not.toBeInTheDocument();
	});

	it("should call setRetryFn when canRetry is true", async () => {
		const setRetryFn = vi.fn();

		render(<Component setRetryFn={setRetryFn} />);

		await waitFor(() => {
			expect(setRetryFn).toHaveBeenCalled();
		});
	});

	it("should not show toast when cancelling is true", async () => {
		render(<Component cancelling />);

		await waitFor(() => {
			expect(toasts.success).not.toHaveBeenCalled();
		});
	});

	it("should show toast when loaded wallets are present", async () => {
		render(<Component />);

		await waitFor(() => {
			expect(toasts.success).toHaveBeenCalled();
		});
	});

	it("should update existing toast when wallet loading toast is already active", async () => {
		vi.mocked(toasts.isActive).mockReturnValue(true);

		render(<Component />);

		await waitFor(() => {
			expect(toasts.update).toHaveBeenCalledWith("wallet-loading", "success", expect.anything());
		});
	});

	it("should call scan when scan-more button is clicked", async () => {
		const scan = vi.fn();

		vi.mocked(useLedgerScanner).mockReturnValue({
			...defaultScannerState,
			scan,
		} as any);

		render(<Component />);

		await userEvent.click(screen.getByTestId("LedgerScanStep__scan-more"));

		await waitFor(() => {
			expect(scan).toHaveBeenCalledWith(profile);
		});
	});
});
